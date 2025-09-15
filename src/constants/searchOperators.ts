export type SearchOperatorType = "source" | "target";

export interface SearchOperator {
  type: SearchOperatorType;
  value: string;
}

export const SEARCH_OPERATOR_REGEX = /([a-zA-Z]+):([a-zA-Z-]+)/gi;
