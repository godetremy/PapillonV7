import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, View } from "react-native";

import { Screen } from "@/router/helpers/types";
import { updateTimetableForWeekInCache } from "@/services/timetable";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { Page } from "./Atoms/Page";

import InfinitePager from "react-native-infinite-pager";
import { HeaderCalendar, LessonsDateModal } from "./LessonsHeader";
import type { Timetable as TTimetable } from "@/services/shared/Timetable";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { AccountService } from "@/stores/account/types";

const RenderPage = ({ index, timetables, getWeekFromIndex, loadTimetableWeek, currentPageIndex } : {
  index: number
  timetables: Record<number, TTimetable>
  getWeekFromIndex: (index: number) => {
    epochWeekNumber: number;
    dayNumber: number;
  }
  loadTimetableWeek: (epochWeekNumber: number) => Promise<void>
  currentPageIndex: number
}) => (
  <View>
    <Page
      index={index}
      timetables={timetables}
      getWeekFromIndex={getWeekFromIndex}
      loadTimetableWeek={loadTimetableWeek}
      current={Platform.OS === "ios" ? currentPageIndex === index : true}
    />
  </View>
);

const Timetable: Screen<"Lessons"> = ({ navigation }) => {
  const { colors } = useTheme();
  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);

  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  let loadedWeeks = useRef<Set<number>>(new Set());
  let currentlyLoadingWeeks = useRef<Set<number>>(new Set());
  let lastAccountID = useRef<string | null>(null);

  // Too hard to type, please send help :D
  const PagerRef = useRef<any>(null);

  const today = useMemo(() => new Date(), []);
  const defaultDate = useMemo(() => new Date(today), [today]);

  const getDateFromIndex = useCallback((index: number) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  }, []);

  const getWeekFromIndex = (index: number) => {
    const date = getDateFromIndex(index);
    const epochWeekNumber = dateToEpochWeekNumber(date);
    const dayNumber = date.getDay();
    return { epochWeekNumber, dayNumber };
  };

  const loadTimetableWeek = async (epochWeekNumber: number, force = false) => {
    if (currentlyLoadingWeeks.current.has(epochWeekNumber)) return;
    if (loadedWeeks.current.has(epochWeekNumber) && !force) return;
    currentlyLoadingWeeks.current.add(epochWeekNumber);

    try {
      if (account.instance) {
        await updateTimetableForWeekInCache(account, epochWeekNumber);
        loadedWeeks.current.add(epochWeekNumber);
      }
      else if (epochWeekNumber in timetables) {
        loadedWeeks.current.add(epochWeekNumber);
      }

    } catch (error) {
      console.error(error);
    } finally {
      currentlyLoadingWeeks.current.delete(epochWeekNumber);
    }
  };

  useEffect(() => {
    for (const key of Object.keys(timetables)) {
      loadedWeeks.current.add(Number(key));
    }
  }, [timetables]);

  useEffect(() => {
    if (lastAccountID.current === null) {
      lastAccountID.current = account.localID;
    }
    else {
      // On reload les semaines si on change de compte.
      if (lastAccountID.current !== account.localID) {
        lastAccountID.current = account.localID;
        loadedWeeks.current = new Set();
        currentlyLoadingWeeks.current = new Set();
      }
    }

    const { epochWeekNumber } = getWeekFromIndex(currentPageIndex);
    loadTimetableWeek(epochWeekNumber);
  }, [currentPageIndex, account?.instance, account.localID]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderCalendar
          index={currentPageIndex}
          changeIndex={(index) => PagerRef.current?.setPage(index)}
          getDateFromIndex={getDateFromIndex}
          showPicker={() => setShowDatePicker(true)}
          navigation={navigation}
        />
      ),
    });
  }, [navigation, currentPageIndex]);

  return (
    <View style={{ backgroundColor: colors.background }}>
      {showDatePicker && (
        <LessonsDateModal
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          currentPageIndex={currentPageIndex}
          defaultDate={new Date()}
          PagerRef={PagerRef}
          getDateFromIndex={getDateFromIndex}
        />
      )}

      <InfinitePager
        onPageChange={setCurrentPageIndex}
        ref={PagerRef}
        renderPage={({ index }) => <RenderPage
          index={index}
          timetables={timetables}
          getWeekFromIndex={getWeekFromIndex}
          loadTimetableWeek={loadTimetableWeek}
          currentPageIndex={currentPageIndex}
        />}
        style={{ height: "100%" }}
      />
    </View>
  );
};

export default Timetable;
