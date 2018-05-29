import { IGroupByExpandState } from './groupby-expand-state.interface';
import { ISortingExpression, SortingDirection } from './sorting-expression.interface';
import { ISortingStrategy, SortingStrategy} from './sorting-strategy';

export interface IGroupingState {
    expressions: ISortingExpression[];
    expansion: IGroupByExpandState[];
    defaultExpanded: boolean;
    strategy?: ISortingStrategy;
}
