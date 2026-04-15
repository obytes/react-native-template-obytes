import { MangoQuerySelector, MangoQuerySortPart, RxDocumentData, RxJsonSchema } from 'rxdb/plugins/core';
/**
 * @recursive
 */
export declare function mangoQuerySelectorToSQL<RxDocType>(schema: RxJsonSchema<RxDocumentData<RxDocType>>, selector: MangoQuerySelector<RxDocType>, mutableParams: any[], prePath?: string): string;
export declare function mangoQuerySortToSQL(primaryPath: string, sorting: MangoQuerySortPart<any>[]): string;
