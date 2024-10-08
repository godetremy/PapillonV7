import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, ChevronDown, ChevronUp, FileText, Paperclip } from "lucide-react-native";
import parse_homeworks from "@/utils/format/format_pronote_homeworks";
import { getSubjectData } from "@/services/shared/Subject";
import { useTheme } from "@react-navigation/native";
import type { Homework } from "@/services/shared/Homework";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import PapillonCheckbox from "@/components/Global/PapillonCheckbox";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";

const HomeworkItem = ({ homework, navigation, onDonePressHandler, index, total }) => {
  const theme = useTheme();
  const [subjectData, setSubjectData] = useState(getSubjectData(homework.subject));

  useEffect(() => {
    const data = getSubjectData(homework.subject);
    setSubjectData(data);
  }, [homework.subject]);

  const [isLoading, setIsLoading] = useState(false);

  const handlePress = useCallback(() => {
    setIsLoading(true);
    onDonePressHandler();
  }, [onDonePressHandler]);

  const [mainLoaded, setMainLoaded] = useState(false);

  useEffect(() => {
    setIsLoading(false);
    setMainLoaded(true);
  }, [homework.done]);

  const parsedContent = useMemo(() => parse_homeworks(homework.content), [homework.content]);

  const [expanded, setExpanded] = useState(false);

  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(expanded ? "180deg" : "0deg") }],
    };
  });

  const [needsExpansion, setNeedsExpansion] = useState(parsedContent.length > 100);

  return (
    <NativeItem
      animated
      onPress={() => navigation.navigate("HomeworksDocument", { homework })}
      chevron={false}
      key={homework.content}
      entering={FadeIn}
      exiting={FadeOut}
      separator={index !== total - 1}
      leading={
        <Reanimated.View
          layout={animPapillon(LinearTransition)}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <PapillonCheckbox
            checked={homework.done}
            loading={isLoading}
            onPress={handlePress}
            style={{ marginRight: 1 }}
            color={subjectData.color}
            loaded={mainLoaded}
          />
        </Reanimated.View>
      }
    >
      <Reanimated.View
        layout={animPapillon(LinearTransition)}
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <Reanimated.View style={{ flex: 1, gap: 4 }} layout={animPapillon(LinearTransition)}>
          <NativeText variant="overtitle" style={{ color: subjectData.color }} numberOfLines={1}>
            {subjectData.pretty}
          </NativeText>
          <Reanimated.View
            layout={animPapillon(LinearTransition)}
            key={parsedContent + expanded}
            entering={expanded && FadeIn.duration(200)}
            exiting={FadeOut.duration(200).delay(50)}
          >
            <NativeText
              variant="default"
              numberOfLines={expanded ? undefined : 3}
            >
              {parsedContent}
            </NativeText>
          </Reanimated.View>

          {homework.attachments.length > 0 && (
            <Reanimated.View
              layout={animPapillon(LinearTransition)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
                borderWidth: 1,
                alignSelf: "flex-start",
                borderColor: theme.colors.text + "33",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 9,
                borderCurve: "continuous",
                marginRight: 16,
              }}
            >
              <Paperclip
                size={18}
                strokeWidth={2.5}
                opacity={0.6}
                color={theme.colors.text}
              />
              <NativeText variant="subtitle" numberOfLines={1}>
                {homework.attachments.length > 1 ?
                  `${homework.attachments.length} pièces jointes` :
                  homework.attachments[0].name
                }
              </NativeText>
            </Reanimated.View>
          )}
        </Reanimated.View>
        {needsExpansion && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animated.View style={[{ marginLeft: 8 }, rotateStyle]}>
              {expanded ? (
                <ChevronUp size={22} strokeWidth={2.5} opacity={0.6} color={theme.colors.text} />
              ) : (
                <ChevronDown size={22} strokeWidth={2.5} opacity={0.6} color={theme.colors.text} />
              )}
            </Animated.View>
          </TouchableOpacity>
        )}
      </Reanimated.View>
    </NativeItem>
  );
};

export default HomeworkItem;