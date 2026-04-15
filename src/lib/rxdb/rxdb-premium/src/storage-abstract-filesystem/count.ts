import {
    PreparedQuery,
    RxStorageCountResult,
    ensureNotFalsy,
    getStartIndexStringFromLowerBound,
    getStartIndexStringFromUpperBound
} from 'rxdb/plugins/core';
import { getIndexName } from '../storage-indexeddb/index.js';
import { RxStorageInstanceAbstractFilesystem } from './storage-instance.js';
import { TaskQueueRunState } from './task-queue.js';
import { IndexRow } from './types.js';
import { compareIndexRows } from './helpers.js';
import {
    boundLE,
    boundGE,
    boundGT,
    boundLT
} from 'rxdb/plugins/storage-memory';

export async function abstractFilesystemCount<RxDocType>(
    instance: RxStorageInstanceAbstractFilesystem<RxDocType>,
    preparedQuery: PreparedQuery<RxDocType>,
    runState: TaskQueueRunState<RxDocType>
): Promise<RxStorageCountResult> {
    const state = await instance.internals.statePromise;
    const useIndex = preparedQuery.queryPlan.index.slice(0);
    const indexName = getIndexName(useIndex);
    const indexState = ensureNotFalsy(state.indexStates.find(s => s.name === indexName));

    // performance shortcut
    if (indexState.rows.length === 0) {
        return {
            count: 0,
            mode: 'fast'
        };
    }

    const queryPlan = preparedQuery.queryPlan;
    const queryPlanFields: string[] = queryPlan.index;

    let index: string[] | undefined = queryPlanFields;
    let lowerBound: any[] = queryPlan.startKeys;
    const lowerBoundString = getStartIndexStringFromLowerBound(
        instance.schema,
        index,
        lowerBound
    );

    let upperBound: any[] = queryPlan.endKeys;
    const upperBoundString = getStartIndexStringFromUpperBound(
        instance.schema,
        index,
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



    /**
     * TODO this should run without iterating.
     * It must be possible to calculate the count
     * with the given index numbers.
     */
    let count = 0;
    let done = false;
    while (!done) {
        const currentRow = indexState.rows[indexOfLower];
        if (
            !currentRow ||
            indexOfLower > indexOfUpper
        ) {
            break;
        }

        count = count + 1;

        indexOfLower++;
    }

    // const startIncrease = queryPlan.inclusiveStart ? 0 : 0;
    // const endIncrease = queryPlan.inclusiveEnd ? 1 : 0;
    // const count = (indexOfUpper - indexOfLower) + startIncrease + endIncrease;
    return {
        count,
        mode: 'fast'
    }
}
