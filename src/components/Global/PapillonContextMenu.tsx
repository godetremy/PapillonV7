import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image, LayoutRectangle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from "react-native";

import Reanimated, {
  FadeIn,
  FadeOut
} from "react-native-reanimated";

import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { Check, CirclePlus, Cog } from "lucide-react-native";

const PapillonContextMenu: React.FC<{
  style?: any;
  children: React.ReactNode;
  shouldOpenContextMenu?: boolean
  setShouldOpenContextMenu?: (value: boolean) => void
}> = ({ children, style, shouldOpenContextMenu , setShouldOpenContextMenu}) => {
  const theme = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();

  const [opened, setOpened] = useState(false); // État pour gérer l'ouverture du menu contextuel
  const [position, setPosition] = useState<LayoutRectangle>(null);
  const currentAccount = useCurrentAccount((store) => store.account!);
  const switchTo = useCurrentAccount((store) => store.switchTo);

  const accounts = useAccounts((store) => store.accounts);

  // Effet pour ouvrir le menu contextuel si shouldOpenContextMenu change
  useEffect(() => {
    if (shouldOpenContextMenu) {
      setOpened(true);
    }
  }, [shouldOpenContextMenu]);

  // Effet pour fermer le menu contextuel si l'utilisateur clique en dehors
  useEffect(() => {
    if (opened) {
      setShouldOpenContextMenu && setShouldOpenContextMenu(false);
    }
  }, [opened]);


  // Fonction pour activer un effet haptique à l'ouverture du menu
  const openEffects = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View onLayout={(layout) => {console.log(layout.nativeEvent.layout); setPosition(layout.nativeEvent.layout);}}>
      <View
        style={[
          {
            zIndex: 100000,
            gap: 10,
          },
          style,
        ]}
      >
        {/* Menu contextuel */}
        {opened && (
          <Reanimated.View
            style={[
              {
                position: "absolute",
                top: position.height + 10,
                left: -(position.width/2),
                backgroundColor: colors.card + "A0",
              },
              styles.menu,
            ]}
            entering={PapillonContextEnter}
            exiting={PapillonContextExit}
          >
            <View
              style={{
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "#FFF1"
              }}
            >
              <BlurView
                intensity={40}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                }}
              />
              {children}
            </View>
          </Reanimated.View>
        )}
      </View>

      <Pressable
        pointerEvents={opened ? "auto" : "none"}
        style={{
          zIndex: 150,
          position: "absolute",
          // The following properties are used to make the container take the full screen
          top: -5000,
          left: -5000,
          width: 100000,
          height: 100000,
          flex: 1,
        }}
        onPress={() => {
          setOpened(false);
        }}
      >
      </Pressable>
    </View>
  );
};

// Styles utilisés dans le composant
const styles = StyleSheet.create({
  container: {
    zIndex: 100,
    position: "absolute",
    // The following properties are used to make the container take the full screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  menu: {
    width: 260,
    borderRadius: 12,
    borderCurve: "continuous",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 6,
  },
});

export default PapillonContextMenu;