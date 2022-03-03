import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Recipient } from "../../logic/orders";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../theme";
import UrlLink from "../utils/UrlLink";

interface Props {
  recipient: Recipient;
}

const RecipientInfo: React.FC<Props> = ({ recipient }) => {
  const [collapsed, setCollapsed] = useState(true);

  return <View style={styles.container}>
    <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
      <View style={styles.row}>
        <FontAwesome5Icon name={"address-card"} solid style={styles.icon} />
        <Text style={styles.name} selectable={true}>{recipient.name}</Text>

        {!recipient.specialInstructions ? undefined :
          <FontAwesome5Icon name={"exclamation-triangle"} solid style={[styles.icon, { color: "#f38300" }]} />}

        <FontAwesome5Icon name={collapsed ? "chevron-down" : "chevron-up"} />
      </View>
    </TouchableOpacity>

    {collapsed ? undefined : <View style={styles.collapsedContainer}>
      {recipient.phones
        .filter(it => it)
        .map((it, i) =>
          <View key={i} style={styles.row}>
            <FontAwesome5Icon name={"phone-alt"} style={styles.icon} />
            <UrlLink url={"tel:" + it}>
              <Text style={styles.phone} selectable={true}>{it}</Text>
            </UrlLink>
          </View>)
      }

      <View style={styles.row}>
        <FontAwesome5Icon name={"map-marker-alt"} solid style={styles.icon} />
        <View style={styles.address}>
          {!recipient.company ? undefined :
            <View style={styles.row}>
              <Text style={styles.addressLabel}>Company:</Text>
              <Text style={styles.addressValue} selectable={true}>{recipient.company}</Text>
            </View>
          }
          {!recipient.unit ? undefined :
            <View style={styles.row}>
              <Text style={styles.addressLabel}>Unit:</Text>
              <Text style={styles.addressValue} selectable={true}>{recipient.unit}</Text>
            </View>
          }
          {!recipient.address ? undefined :
            <View style={styles.row}>
              <Text style={styles.addressLabel}>Address:</Text>
              <UrlLink url={Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" }) + recipient.address}
                       style={{ flex: 1 }}>
                <Text style={[styles.addressValue, styles.url]}
                      selectable={true}>
                  {recipient.address}
                </Text>
              </UrlLink>
            </View>
          }
        </View>
      </View>

      {!recipient.specialInstructions ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"exclamation-triangle"} solid style={styles.icon} />
          <Text style={styles.specialInstructions} selectable={true}>{recipient.specialInstructions}</Text>
        </View>
      }

      {!recipient.message ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"comment"} solid style={styles.icon} />
          <Text style={styles.message} selectable={true}>{recipient.message}</Text>
        </View>
      }
    </View>}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  collapsedContainer: {
    paddingBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 3,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
  },

  name: {
    flex: 1,
    paddingVertical: 8,
    fontWeight: "bold",
  },
  phone: {
    color: lightColors.url,
  },

  address: {
    flex: 1,
  },
  addressLabel: {
    fontStyle: "italic",
    marginRight: 10,
    minWidth: 65,
  },
  addressValue: {
    flex: 1,
  },

  specialInstructions: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#a00",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: lightColors.surface2,
    marginTop: 10,
    marginBottom: 10,
  },

  message: {
    flex: 1,
    borderWidth: 1,
    borderColor: lightColors.borderVariant,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: lightColors.surface2,
  },

  url: {
    color: lightColors.url,
  },
});

export default RecipientInfo;
