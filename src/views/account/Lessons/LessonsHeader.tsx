import { useTheme } from "@react-navigation/native";
import React from "react";
import { Dimensions, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

import {Calendar, CirclePlus, FileText, X} from "lucide-react-native";

import Reanimated, {
  Easing,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  ZoomIn,
  ZoomOut
} from "react-native-reanimated";

import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonContextMenu from "@/components/Global/PapillonContextMenu";
import {NativeText} from "@/components/Global/NativeComponents";

interface HeaderCalendarProps {
  index: number,
  changeIndex: (index: number) => unknown,
  getDateFromIndex: (index: number) => Date
  showPicker: () => void,
  navigation: any
}

const HeaderCalendar: React.FC<HeaderCalendarProps> = ({
  index,
  changeIndex,
  getDateFromIndex,
  showPicker,
  navigation
}) => {
  const dims = Dimensions.get("window");
  const tablet = dims.width > 600;
  const { colors } = useTheme();
  const theme = useTheme();

  const [shouldOpenContextMenu, setShouldOpenContextMenu] = React.useState(false);

  return (
    <Reanimated.View
      style={{
        width: Dimensions.get("window").width - 50 - (tablet ? 400 : 0),
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Reanimated.View
        style={{
          width: 1000,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {[-2, -1, 0, 1, 2].map((offsetIndex) => (
          <View>
            <HeaderDateComponent
              key={index + offsetIndex}
              active={offsetIndex === 0}
              date={getDateFromIndex(index + offsetIndex)}
              onPress={() => offsetIndex === 0 ? showPicker() : changeIndex(index + offsetIndex)}
              onLongPress={() => offsetIndex === 0 ? setShouldOpenContextMenu(true) : null}
            />
            <PapillonContextMenu
              shouldOpenContextMenu={offsetIndex === 0 ? shouldOpenContextMenu: false}
              setShouldOpenContextMenu={setShouldOpenContextMenu}
            >
              <Pressable
                onPress={() => {
                  setShouldOpenContextMenu(false);
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0)", // Utilisation de rgba pour l'assombrissement
                    opacity: 0.4,
                  },
                ]}
                disabled={true}
              >
                <View
                  style={{
                    flexDirection: "row",
                    padding: 9,
                    borderStyle: "solid",
                    borderBottomColor: colors.border,
                    borderBottomWidth: 2,
                    borderColor: theme.dark ? "#ffffff20" :"#00000020",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Calendar
                    size={26}
                    color={colors.text}
                  />
                  <View style={{flex: 1}}>
                    <NativeText variant={"overtitle"}>
                      Ajouter au calendrier
                    </NativeText>
                    <NativeText variant={"subtitle"}>
                      Bientôt disponible
                    </NativeText>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShouldOpenContextMenu(false);
                  // @ts-expect-error : TODO: https://reactnavigation.org/docs/typescript/#specifying-default-types-for-usenavigation-link-ref-etc
                  navigation.navigate("ServiceSelector");
                }}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0)", // Utilisation de rgba pour l'assombrissement
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    padding: 9,
                    borderStyle: "solid",
                    borderBottomColor: colors.border,
                    borderColor: theme.dark ? "#ffffff20" :"#00000020",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <FileText
                    size={26}
                    color={colors.text}
                  />
                  <View style={{flex: 1}}>
                    <NativeText variant={"overtitle"}>
                      Exporter en PDF
                    </NativeText>
                    <NativeText variant={"subtitle"}>
                      Exporter le planning de la semaine en PDF
                    </NativeText>
                  </View>
                </View>
              </Pressable>
            </PapillonContextMenu>
          </View>
        ))}
      </Reanimated.View>
    </Reanimated.View>
  );
};

interface HeaderDateComponentProps {
  date: Date,
  active: boolean,
  onPress?: () => unknown
  onLongPress?: () => unknown
}

const HeaderDateComponent: React.FC<HeaderDateComponentProps> = ({
  date,
  active,
  onPress,
  onLongPress
}) => {
  const { colors } = useTheme();

  return (
    <Reanimated.View
      // @ts-expect-error : average reanimated issue.
      layout={LinearTransition.duration(300).easing(Easing.bezier(0.5, 0, 0, 1))}
    >
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
        <Reanimated.View
          style={[
            {
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 6,
              borderRadius: 10,
              borderCurve: "continuous",
              flexDirection: "row",
              paddingHorizontal: 10,
              overflow: "hidden",
            },
            !active && {
              width: 120,
              opacity: 0.4,
            }
          ]}
        >
          {active &&
            <Reanimated.View
              layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.primary + "21",
              }}
              entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)}
              exiting={ZoomOut.springify().mass(1).damping(20).stiffness(300)}
            />
          }

          {active &&
            <Reanimated.View
              layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
              entering={ZoomIn.duration(200)}
              exiting={ZoomOut.duration(200)}
            >
              <Calendar
                size={20}
                color={colors.primary}
              />
            </Reanimated.View>
          }

          <Reanimated.Text
            numberOfLines={1}
            style={{
              fontSize: 16,
              fontFamily: "medium",
              color: !active ? colors.text : colors.primary,
            }}
            layout={LinearTransition.duration(200)}
          >
            {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
          </Reanimated.Text>
        </Reanimated.View>
      </TouchableOpacity>
    </Reanimated.View>
  );
};

interface LessonsDateModalProps {
  showDatePicker: boolean,
  setShowDatePicker: (show: boolean) => unknown,
  currentPageIndex: number,
  defaultDate: Date,
  // NOTE: PagerRef is hard to type, may need help on this ?
  PagerRef: React.RefObject<any>,
  getDateFromIndex: (index: number) => Date
}

const LessonsDateModal: React.FC<LessonsDateModalProps> = ({
  showDatePicker,
  setShowDatePicker,
  currentPageIndex,
  defaultDate,
  PagerRef,
  getDateFromIndex
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (Platform.OS === "android") {
    return (showDatePicker &&
      <RNDateTimePicker
        style={{
          marginHorizontal: 8,
          marginTop: -5,
          marginBottom: 10,
        }}
        value={getDateFromIndex(currentPageIndex)}
        display={"calendar"}
        mode="date"
        onChange={(_event, selectedDate) => {
          if (selectedDate) {
            const newPageIndex = Math.round((selectedDate.getTime() - defaultDate.getTime()) / 86400000);
            PagerRef.current?.setPage(newPageIndex);
          }

          setShowDatePicker(false);
        }}
        onError={() => {
          setShowDatePicker(false);
        }}
      />
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showDatePicker}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "#00000099",
          paddingBottom: insets.bottom + 10,
        }}
      >
        <Pressable
          style={{
            width: "100%",
            flex: 1,
          }}
          onPress={() => setShowDatePicker(false)}
        />

        {showDatePicker &&
          <Reanimated.View
            style={{
              width: Dimensions.get("window").width - 20,
              backgroundColor: colors.card,
              overflow: "hidden",
              borderRadius: 16,
              borderCurve: "continuous",
            }}
            entering={FadeInDown.mass(1).damping(20).stiffness(300)}
            exiting={FadeOutDown.mass(1).damping(20).stiffness(300)}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                paddingHorizontal: 18,
                paddingVertical: 14,
                backgroundColor: colors.primary,
                gap: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "medium",
                  color: "#ffffff99",
                }}
              >
                Sélection de la date
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "semibold",
                  color: "#fff",
                }}
              >
                {getDateFromIndex(currentPageIndex).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </Text>

              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  backgroundColor: "#ffffff39",
                  opacity: 0.7,
                  padding: 6,
                  borderRadius: 50,
                }}
                onPress={() => setShowDatePicker(false)}
              >
                <X
                  size={20}
                  strokeWidth={3}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            <RNDateTimePicker
              style={{
                marginHorizontal: 8,
                marginTop: -5,
                marginBottom: 10,
              }}
              value={getDateFromIndex(currentPageIndex)}
              display={"inline"}
              mode="date"
              locale="fr-FR"
              accentColor={colors.primary}
              onChange={(_event, selectedDate) => {
                if (selectedDate) {
                  const newPageIndex = Math.round((selectedDate.getTime() - defaultDate.getTime()) / 86400000);
                  PagerRef.current?.setPage(newPageIndex);
                }
              }}
            />
          </Reanimated.View>
        }
      </View>
    </Modal>
  );
};

export { HeaderCalendar, LessonsDateModal };