import { EventEmitter } from '@angular/core';

export enum TransactionType {
    ADD = 'add',
    DELETE = 'delete',
    UPDATE = 'update'
}

export enum TransactionEventOrigin {
    UNDO = 'undo',
    REDO = 'redo',
    CLEAR = 'clear',
    ADD = 'add',
    END = 'endPending'
}

export interface Transaction {
    id: any;
    type: TransactionType;
    newValue: any;
    pending?: boolean;
    pendingIndex?: number;
}

/**
 * @experimental
 * @hidden
 */
export interface HierarchicalTransaction extends Transaction {
    path?: any[];
}

export interface State {
    value: any;
    recordRef: any;
    type: TransactionType;
    pendingIndex?: number;
}

export interface Action<T extends Transaction> {
    transaction: T;
    recordRef: any;
}

export interface StateUpdateEvent {
    origin: TransactionEventOrigin;
    actions: Action<Transaction>[];
}

/**
 * @experimental
 * @hidden
 */
export interface HierarchicalState extends State {
    path: any[];
}

export interface TransactionService<T extends Transaction, S extends State> {
    /**
     * Returns whether transaction is enabled for this service
     */
    readonly enabled: boolean;

    /**
     * Event fired when transaction state has changed - add transaction, commit all transactions, undo and redo
     */
    onStateUpdate?: EventEmitter<StateUpdateEvent>;

    /**
     * @returns if there are any transactions in the Undo stack
     */
    canUndo: boolean;

    /**
     * @returns if there are any transactions in the Redo stack
     */
    canRedo: boolean;

    /**
     * Adds provided  transaction with recordRef if any
     *
     * @param transaction Transaction to be added
     * @param recordRef Reference to the value of the record in the data source related to the changed item
     */
    add(transaction: T, recordRef?: any): void;

    /**
     * Returns all recorded transactions in chronological order
     *
     * @param id Optional record id to get transactions for
     * @returns All transaction in the service or for the specified record
     */
    getTransactionLog(id?: any): T[];

    /**
     * Remove the last transaction if any
     */
    undo(): void;

    /**
     * Applies the last undone transaction if any
     */
    redo(): void;

    /**
     * Returns aggregated changes from all transactions
     *
     * @param mergeChanges If set to true will merge each state's value over relate recordRef
     * and will record resulting value in the related transaction
     * @returns Collection of aggregated transactions for each changed record
     */
    getAggregatedChanges(mergeChanges: boolean): T[];

    getAggregatedPendingAddChanges(mergeChanges: boolean): T[];

    /**
     * Returns the state of the record with provided id
     *
     * @param id The id of the record
     * @param pending Should get pending state
     * @returns State of the record if any
     */
    getState(id: any, pending?: boolean): S;

    /**
     * Returns value of the required id including all uncommitted changes
     *
     * @param id The id of the record to return value for
     * @param mergeChanges If set to true will merge state's value over relate recordRef
     * and will return merged value
     * @returns Value with changes or **null**
     */
    getAggregatedValue(id: any, mergeChanges: boolean): any;

    /**
     * Applies all transactions over the provided data
     *
     * @param data Data source to update
     * @param id Optional record id to commit transactions for
     */
    commit(data: any[], id?: any): void;

    /**
     * Clears all transactions
     *
     * @param id Optional record id to clear transactions for
     */
    clear(id?: any): void;

    /**
     * Starts pending transactions. All transactions passed after call to startPending
     * will not be added to transaction log
     */
    startPending(): void;

    /**
     * Clears all pending transactions and aggregated pending state. If commit is set to true
     * commits pending states as single transaction
     *
     * @param commit Should commit the pending states
     */
    endPending(commit: boolean): void;
}
