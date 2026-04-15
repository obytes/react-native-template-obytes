import { newRxError } from 'rxdb/plugins/core';
import {
    RXDB_VERSION
} from 'rxdb/plugins/utils'
import {
    RXDB_PREMIUM_VERSION
} from './rxdb-premium-version.js';

let versionCheckEnabled = true;
export function disableVersionCheck() {
    versionCheckEnabled = false;
}
export function checkVersion() {
    if (
        versionCheckEnabled &&
        RXDB_VERSION !== RXDB_PREMIUM_VERSION as string
    ) {
        throw newRxError('SNH', {
            name: 'Version mismatch detected',
            args: {
                rxdbVersion: RXDB_VERSION,
                rxdbPremiumVersion: RXDB_PREMIUM_VERSION
            }
        });
    }

}
