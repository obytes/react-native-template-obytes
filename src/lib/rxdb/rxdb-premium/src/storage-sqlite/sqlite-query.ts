import {
    getPrimaryFieldOfPrimaryKey,
    getSchemaByObjectPath,
    MangoQuerySelector,
    MangoQuerySortPart,
    randomCouchString,
    RxDocumentData,
    RxJsonSchema
} from 'rxdb/plugins/core';
import { getJsonExtract, isPlainObject, PARAM_KEY } from './sqlite-helpers.js';


const LOGICAL_MANGO_OPERATORS = ['$or', '$and'];

/**
 * @recursive
 */
export function mangoQuerySelectorToSQL<RxDocType>(
    schema: RxJsonSchema<RxDocumentData<RxDocType>>,
    selector: MangoQuerySelector<RxDocType>,
    mutableParams: any[],
    prePath?: string
): string {
    const primaryPath = getPrimaryFieldOfPrimaryKey(schema.primaryKey) as any;
    const stringParts = Object.entries(selector).map(([key, selectorPart]) => {
        if (key.startsWith('$')) {
            // is operator
            if (LOGICAL_MANGO_OPERATORS.includes(key)) {
                // logical operator
                const sqlCombinator = ' ' + key.substring(1).toUpperCase() + ' ';
                const logicalParts = selectorPart.map((v: any) => mangoQuerySelectorToSQL(schema, v, mutableParams, prePath));
                if (logicalParts.length > 1) {
                    return '(' + logicalParts.join(sqlCombinator) + ')';
                } else {
                    return logicalParts.join(sqlCombinator);
                }
            } else {
                // query selector operator
                if (!prePath) {
                    throw new Error('cannot have selector operator on the top level ' + key);
                }
                switch (key) {
                    case '$eq':
                        if (selectorPart === null) {
                            return getJsonExtract(primaryPath, prePath) + ' IS NULL';
                        } else {
                            mutableParams.push(selectorPart);
                            return getJsonExtract(primaryPath, prePath) + '=' + PARAM_KEY;
                        }
                        break;
                    case '$ne':
                        if (selectorPart === null) {
                            return getJsonExtract(primaryPath, prePath) + ' IS NOT NULL';
                        } else {
                            mutableParams.push(selectorPart);
                            const baseSQLOperator = getJsonExtract(primaryPath, prePath) + '!=' + PARAM_KEY;
                            if (selectorPart === null) {
                                return baseSQLOperator;
                            } else {
                                /**
                                 * The field might be optional so it can be NULL and must still match
                                 * the $ne operation.
                                 */
                                return '(' +
                                    baseSQLOperator +
                                    ' OR (' + getJsonExtract(primaryPath, prePath) + ' IS NULL)' +
                                    ')';
                            }
                        }
                        break;
                    case '$gt':
                        mutableParams.push(selectorPart);
                        return getJsonExtract(primaryPath, prePath) + '>' + PARAM_KEY;
                        break;
                    case '$gte':
                        mutableParams.push(selectorPart);
                        return getJsonExtract(primaryPath, prePath) + '>=' + PARAM_KEY;
                        break;
                    case '$lt':
                        mutableParams.push(selectorPart);
                        return getJsonExtract(primaryPath, prePath) + '<' + PARAM_KEY;
                        break;
                    case '$lte':
                        mutableParams.push(selectorPart);
                        return getJsonExtract(primaryPath, prePath) + '<=' + PARAM_KEY;
                        break;
                    case '$exists':
                        if (selectorPart) {
                            /**
                             * SQLite has no JSON_EXISTS method,
                             * but we can ensure existence of a field
                             * by comparing it to a random string that would never match.
                             */
                            mutableParams.push('rand-' + randomCouchString(10));
                            return getJsonExtract(primaryPath, prePath) + '!=' + PARAM_KEY;
                        } else {
                            return getJsonExtract(primaryPath, prePath) + ' IS NULL';
                        }
                        break;
                    case '$in':
                        selectorPart.forEach(p => mutableParams.push(p));
                        const schemaPart = getSchemaByObjectPath(schema, prePath);

                        /**
                         * The $in operator can either be used with a string-value
                         * to find all docs where the array contains the one string,
                         * OR it can be used with a string-array-value where any string of the
                         * array matches any string of the documents array value.
                         */
                        if (schemaPart && schemaPart.type === 'array') {
                            /**
                             * @link https://stackoverflow.com/a/63653966/3443137
                             */
                            return 'EXISTS (SELECT 1 FROM json_each(' + getJsonExtract(primaryPath, prePath) + ') WHERE value IN (' + new Array(selectorPart.length).fill(PARAM_KEY).join(',') + '))';
                        } else {
                            return getJsonExtract(primaryPath, prePath) + ' IN (' + new Array(selectorPart.length).fill(PARAM_KEY).join(',') + ')';
                        }
                        break;
                    case '$nin':
                        mutableParams.push(selectorPart);
                        return getJsonExtract(primaryPath, prePath) + ' NOT IN (' + PARAM_KEY + ')';
                        break;

                    /**
                     * TODO find a way to correctly transforming $elemMatch to SQL
                     * and to make it work on arrays of objects.
                     */
                    // case '$elemMatch':
                    //     const schemaPart = getSchemaByObjectPath(schema, prePath);
                    //     console.log('prePath:; ' + prePath);
                    //     console.dir(schemaPart);
                    //     /**
                    //      * If $elemMatch is used over an array,
                    //      * the document matches if at least one item
                    //      * of the array matches the $elemMatch operator.
                    //      * 
                    //      * @link https://stackoverflow.com/a/63653966/3443137
                    //      */
                    //     if (schemaPart.type === 'array') {
                    //         const perItemQuery = mangoQuerySelectorToSQL(
                    //             schema,
                    //             selectorPart,
                    //             mutableParams,
                    //             prePath
                    //         );
                    //         console.log('perItemQuery:');
                    //         console.dir(perItemQuery);

                    //         const ret = 'EXISTS (SELECT 1 FROM json_each(json_extract(data, \'$.' + prePath + '\')) WHERE ' + perItemQuery + ')';
                    //         console.log('ret: ');
                    //         console.dir(ret);
                    //         return ret;
                    //     } else {
                    //         return mangoQuerySelectorToSQL(
                    //             schema,
                    //             selectorPart,
                    //             mutableParams,
                    //             prePath
                    //         );
                    //     }
                    //     break;
                    default:
                        const err = new Error('operator ' + key + ' not implemented');
                        (err as any).operator = key;
                        (err as any).isNonImplementedOperatorError = true;
                        throw err;
                }
            }
        } else {
            if (!isPlainObject(selectorPart)) {
                // is is an $eq shortcut like { foo: 'bar'}
                mutableParams.push(selectorPart);
                return getJsonExtract(primaryPath, key) + '=' + PARAM_KEY + '';
            } else {
                // is not an operator
                return mangoQuerySelectorToSQL(
                    schema,
                    selectorPart as any,
                    mutableParams,
                    key
                );
            }
        }
    });
    const ret = '(' + stringParts.join(' AND ') + ')';
    return ret;
}

export function mangoQuerySortToSQL(
    primaryPath: string,
    sorting: MangoQuerySortPart<any>[]
): string {
    return 'ORDER BY ' + sorting.map(sortPart => {
        const [path, direction] = Object.entries(sortPart)[0];
        return getJsonExtract(primaryPath, path) + ' ' + direction.toUpperCase() + '';
    }).join(', ')
}
