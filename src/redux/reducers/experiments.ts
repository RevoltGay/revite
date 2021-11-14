import { getState } from "..";

export type Experiments =
    | "owo"
    | "uwu"
    | "uvu"
    | "rainbow"
    | "censor"
    | "insane_asylum"
    | "light_insane_asylum"
    | "search"
    | "theme_shop";

export const AVAILABLE_EXPERIMENTS: Experiments[] = [
    "owo",
    "uwu",
    "uvu",
    "rainbow",
    "censor",
    "insane_asylum",
    "light_insane_asylum",
    "theme_shop",
];

export const EXPERIMENTS: {
    [key in Experiments]: { title: string; description: string };
} = {
    search: {
        title: "Search",
        description: "Allows you to search for messages in channels.",
    },
    theme_shop: {
        title: "Theme Shop",
        description: "Allows you to access and set user submitted themes.",
    },
    owo: {
        title: "OwO",
        description: "OwOifwies ywour outgwoing mwessages.",
    },
    uwu: {
        title: "UwU",
        description: "UwUifwies ywouw outgwoing mwessages ＼(＾▽＾)／",
    },
    uvu: {
        title: "UvU",
        description: "UvUifwies ywouw owoutgwowoing mwessages ＼(＾▽＾)／",
    },
    rainbow: {
        title: "Rainbow",
        description: "Turns your outgoing messages into a rainbow.",
    },
    censor: {
        title: "Censor",
        description: "",
    },
    insane_asylum: {
        title: "Insane asylum",
        description: "JAN",
    },
    light_insane_asylum: {
        title: "Insane asylum LITE",
        description: "Jan",
    },
};

export interface ExperimentOptions {
    enabled?: Experiments[];
}

export type ExperimentsAction =
    | { type: undefined }
    | {
          type: "EXPERIMENTS_ENABLE";
          key: Experiments;
      }
    | {
          type: "EXPERIMENTS_DISABLE";
          key: Experiments;
      };

export function experiments(
    state = {} as ExperimentOptions,
    action: ExperimentsAction,
): ExperimentOptions {
    switch (action.type) {
        case "EXPERIMENTS_ENABLE":
            return {
                ...state,
                enabled: [
                    ...(state.enabled ?? [])
                        .filter((x) => AVAILABLE_EXPERIMENTS.includes(x))
                        .filter((v) => v !== action.key),
                    action.key,
                ],
            };
        case "EXPERIMENTS_DISABLE":
            return {
                ...state,
                enabled: state.enabled
                    ?.filter((v) => v !== action.key)
                    .filter((x) => AVAILABLE_EXPERIMENTS.includes(x)),
            };
        default:
            return state;
    }
}

export function isExperimentEnabled(
    name: Experiments,
    experiments: ExperimentOptions = getState().experiments,
) {
    return experiments.enabled?.includes(name) ?? false;
}
