import { useTheme } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { Image, Platform, RefreshControl as RNRefreshControl, Text, View } from "react-native";
import { createNativeWrapper, ScrollView } from "react-native-gesture-handler";

import Reanimated, {
  FadeInDown,
  FadeOut
} from "react-native-reanimated";

import { Sofa, Utensils } from "lucide-react-native";
import { TimetableItem } from "./Item";
import LessonsNoCourseItem from "./NoCourse";
import { Timetable } from "@/services/shared/Timetable";

const RefreshControl = createNativeWrapper(RNRefreshControl, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});

const getDuration = (minutes: number): string => {
  const durationHours = Math.floor(minutes / 60);
  const durationRemainingMinutes = minutes % 60;
  return `${durationHours} h ${lz(durationRemainingMinutes)} min`;
};

const lz = (num: number) => (num < 10 ? `0${num}` : num);

interface Props {
  index: number
  timetables: Record<number, Timetable>
  loadTimetableWeek: (epochWeekNumber: number, force?: boolean) => Promise<void>
  getWeekFromIndex: (index: number) => {
    epochWeekNumber: number;
    dayNumber: number;
  }
  current: boolean
}

export const Page: React.FC<Props> = ({
  index,
  timetables,
  loadTimetableWeek,
  current,
  getWeekFromIndex,
}) => {
  const { colors } = useTheme();
  const { epochWeekNumber, dayNumber } = useMemo(() => getWeekFromIndex(index), [index, getWeekFromIndex]);

  const currentDayTimetable: Timetable = (!(epochWeekNumber in timetables)) ? []
    : timetables[epochWeekNumber]
      .filter(c => new Date(c.startTimestamp).getDay() === dayNumber)
      .sort((a, b) => a.startTimestamp - b.startTimestamp);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTimetableWeek(epochWeekNumber, true);
    setIsRefreshing(false);
  };

  return (
    <Reanimated.View style={{ height: "100%" }}>
      <ScrollView
        style={{ flex: 1, height: "100%" }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {currentDayTimetable.length > 0 ? (
          current && (
            <View style={{ paddingHorizontal: 10, paddingVertical: 10, gap: 10 }}>
              {currentDayTimetable.map((item, i) => (
                <View key={item.startTimestamp} style={{ gap: 10 }}>
                  <TimetableItem key={item.startTimestamp} item={item} index={i} />

                  {currentDayTimetable[i + 1] &&
                    currentDayTimetable[i + 1].startTimestamp - item.endTimestamp > 1740000 && (
                    <SeparatorCourse
                      i={i}
                      start={currentDayTimetable[i + 1].startTimestamp}
                      end={item.endTimestamp}
                    />
                  )}
                </View>
              ))}
            </View>
          )
        ) : (
          current && (
            <View style={{ flex: 1, paddingTop: 50 }}>
              <LessonsNoCourseItem />
            </View>
          )
        )}
      </ScrollView>
    </Reanimated.View>
  );
};

const SeparatorCourse: React.FC<{
  i: number
  start: number
  end: number
}> = ({ i, start, end }) => {
  const { colors } = useTheme();
  const startHours = new Date(start).getHours();

  return (
    <Reanimated.View
      style={{
        borderRadius: 10,
        backgroundColor: colors.card,
        borderColor: colors.text + "33",
        borderWidth: 0.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        marginLeft: 70,
      }}
      entering={
        Platform.OS === "ios" ?
          FadeInDown.delay(50 * i)
            .springify()
            .mass(1)
            .damping(20)
            .stiffness(300)
          : void 0
      }
      exiting={Platform.OS === "ios" ? FadeOut.duration(300) : void 0}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderRadius: 10,
          gap: 10,
          overflow: "hidden",
          backgroundColor: colors.text + "11",
        }}
      >
        <Image
          source={require("../../../../../assets/images/mask_course.png")}
          resizeMode='cover'
          tintColor={colors.text}
          style={{
            position: "absolute",
            top: "-20%",
            left: "-20%",
            width: "200%",
            height: "250%",
            opacity: 0.05,
          }}
        />

        {startHours > 11 &&
          startHours < 14 ? (
            <Utensils size={20} color={colors.text} />
          ) : (
            <Sofa size={20} color={colors.text} />
          )}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: "semibold",
            fontSize: 16,
            color: colors.text,
          }}
        >
          {startHours > 11 &&
            startHours < 14
            ? "Pause méridienne"
            : "Pas de cours"}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            fontFamily: "medium",
            fontSize: 15,
            opacity: 0.5,
            color: colors.text,
          }}
        >
          {getDuration(
            Math.round((start - end) / 60000)
          )}
        </Text>
      </View>
    </Reanimated.View>
  );
};