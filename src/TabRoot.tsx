import React, {
  createContext,
  memo,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import type { IProvider } from "./types";
import { _useTabView } from "./hooks/_useTabView";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { View } from "react-native";
import { ROOT_ID } from "./constant";

const Context = createContext<IProvider | null>(null);

export const TabRoot = memo(function TabRoot({
  children,
  initialHeight,
}: PropsWithChildren<{
  initialHeight?: {
    header?: number;
    bar?: number;
  };
}>) {
  /* get value same as TabView */
  const tabViewValue = _useTabView(true, initialHeight);

  const { headerHeight, barHeight } = tabViewValue;

  const animatedScrollValue = useSharedValue(0);
  const scrollValueMap = useSharedValue<{ [id: string]: number }>({});

  const parentHeaderHeight = useSharedValue(0);
  const parentBarHeight = useSharedValue(0);
  const parentTabs = useSharedValue<string[]>([]);
  const parentAnimatedIndex = useSharedValue(0);

  const emptyHeaderHeight = useSharedValue(0);
  const emptyBarHeight = useSharedValue(0);

  const minBarTop = useDerivedValue(
    () => headerHeight.value - barHeight.value,
    []
  );
  const rootIndex = useSharedValue("0");
  const rootAnimatedIndex = useSharedValue("0");

  const animatedHeight = useDerivedValue(() => {
    // const val = Math.min(
    //   0,
    //   Math.max(
    //     0 - animatedScrollValue.value,
    //     barHeight.value - headerHeight.value,
    //   ),
    // );
    //
    // if (animatedScrollValue.value - prevVal.value > 200) {
    //   return withTiming(val, {duration: 200});
    // }
    //
    // prevVal.value = animatedScrollValue.value;

    return Math.max(animatedScrollValue.value, 0);
  }, []);

  const returnValue = useMemo(
    () => ({
      label: ROOT_ID,
      animatedScrollValue,
      scrollValueMap,
      animatedHeight,
      parentHeaderHeight,
      parentBarHeight,
      parentTabs,
      parentAnimatedIndex,
      emptyHeaderHeight,
      emptyBarHeight,
      minBarTop,
      rootIndex,
      rootAnimatedIndex,
      ...tabViewValue,
    }),
    [tabViewValue]
  );

  return (
    <Context.Provider value={returnValue}>
      <View style={{ flex: 1, overflow: "hidden" }}>{children}</View>
    </Context.Provider>
  );
});

export const useTabRoot = () => {
  let value = useContext<IProvider | null>(Context);
  if (value === null)
    throw new Error("wrap component with TabProvider before using");
  return value;
};
