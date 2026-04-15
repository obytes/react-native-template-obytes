import {
    PreparedQuery,
    RxDocumentData,
    RxStorageCountResult,
    ensureNotFalsy,
    getQueryMatcher,
    getSortComparator,
    getStartIndexStringFromLowerBound,
    getStartIndexStringFromUpperBound
} from 'rxdb/plugins/core';
import { getIndexName } from '../storage-indexeddb/index.js';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { TaskQueueRunState, getAccessHandle } from './task-queue.js';
import {
    IndexRow
} from './types.js';
import {
    boundGE,
    boundGT,
    boundLE,
    boundLT
} from 'rxdb/plugins/storage-memory';
import { getDocumentsJson, getDocumentsJsonString } from './documents-file.js';
import { compareIndexRows } from './helpers.js';

/**
 * There are different modes of querying.
 * -    One is when we need the queryMatcher to check if the
 *      row must be in the query result. -> we must fully load the docData
 * -    The other is when we do not need a queryMatcher
 *      and we can determine the result rows only by using the index.
 */
export async function abstractFilesystemQuery<RxDocType>(
    instance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    preparedQuery: PreparedQuery<RxDocType>,
    runState: TaskQueueRunState<RxDocType>
) {
    const state = await instance.internals.statePromise;

    const useIndex = preparedQuery.queryPlan.index.slice(0);

    const indexName = getIndexName(useIndex);
    const indexState = ensureNotFalsy(state.indexStates.find(s => s.name === indexName));


    // performance shortcut
    if (indexState.rows.length === 0) {
        return {
            documents: []
        };
    }

    const queryPlan = preparedQuery.queryPlan;
    const query = preparedQuery.query;
    const skip = query.skip ? query.skip : 0;
    const limit = query.limit ? query.limit : Infinity;
    const skipPlusLimit = skip + limit;

    let queryMatcher: ReturnType<typeof getQueryMatcher> | false = false;
    if (!queryPlan.selectorSatisfiedByIndex) {
        queryMatcher = getQueryMatcher(
            instance.schema,
            preparedQuery.query
        ) as any;
    }

    const mustManuallyResort = !queryPlan.sortSatisfiedByIndex;
    let lowerBound: any[] = queryPlan.startKeys;
    const lowerBoundString = getStartIndexStringFromLowerBound(
        instance.schema,
        useIndex,
        lowerBound
    );

    let upperBound: any[] = queryPlan.endKeys;
    const upperBoundString = getStartIndexStringFromUpperBound(
        instance.schema,
        useIndex,
        upperBound
    );


    let indexOfLower = (queryPlan.inclusiveStart ? boundGE : boundGT)<IndexRow>(
        indexState.rows,
        [
            lowerBoundString
        ] as any,
        compareIndexRows
    );

    let indexOfUpper = (queryPlan.inclusiveEnd ? boundLE : boundLT)<IndexRow>(
        indexState.rows,
        [
            upperBoundString
        ] as any,
        compareIndexRows
    );


    const documentFileAccessHandle = await getAccessHandle(state.documentFileHandle, runState);

    let rows: RxDocumentData<RxDocType>[] = [];
    if (queryMatcher) {
        let done = false;
        while (!done) {
            const currentIndexRow = indexState.rows[indexOfLower];
            if (
                !currentIndexRow ||
                indexOfLower > indexOfUpper
            ) {
                break;
            }
            const docsData = await getDocumentsJson(
                state,
                documentFileAccessHandle,
                runState,
                [currentIndexRow]
            );
            const docData = docsData[0];

            if (queryMatcher(docData)) {
                rows.push(docData);
            }

            if (
                (rows.length >= skipPlusLimit && !mustManuallyResort) ||
                indexOfLower >= indexState.rows.length
            ) {
                done = true;
            }
            indexOfLower++;
        }
    } else {
        let metaMapEntries: IndexRow[] = [];
        let done = false;
        while (!done) {
            const currentIndexRow = indexState.rows[indexOfLower];
            if (
                !currentIndexRow ||
                indexOfLower > indexOfUpper
            ) {
                break;
            }
            metaMapEntries.push(currentIndexRow);
            if (
                (rows.length >= skipPlusLimit && !mustManuallyResort) ||
                indexOfLower >= indexState.rows.length
            ) {
                done = true;
            }
            indexOfLower++;
        }

        // performance shortcut, directly return json string
        // if we do not need to analyze the document data.
        if (!mustManuallyResort) {
            metaMapEntries = metaMapEntries.slice(skip, skipPlusLimit);
            const docsJsonData = await getDocumentsJsonString(
                state,
                documentFileAccessHandle,
                runState,
                metaMapEntries,
                'Array'
            );
            return Promise.resolve(
                '{"documents": ' + docsJsonData + '}'
            );
        }

        rows = await getDocumentsJson(
            state,
            documentFileAccessHandle,
            runState,
            metaMapEntries
        );

    }

    if (mustManuallyResort) {
        const sortComparator = getSortComparator(instance.schema, preparedQuery.query);
        rows = rows.sort(sortComparator);
    }

    // apply skip and limit boundaries.
    rows = rows.slice(skip, skipPlusLimit);
    return Promise.resolve({
        documents: rows
    });

}
