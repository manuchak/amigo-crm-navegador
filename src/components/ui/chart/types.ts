
import { ReactNode } from "react";

export type ChartConfig = {
  [k in string]: {
    label?: ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<"light" | "dark", string> }
  );
};

export type ChartContextProps = {
  config: ChartConfig;
};
