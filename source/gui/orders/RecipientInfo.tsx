import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        <Text style={styles.name}>{recipient.name}</Text>
        <FontAwesome5Icon name={collapsed ? "chevron-down" : "chevron-up"} />
      </View>
    </TouchableOpacity>

    {collapsed ? undefined : <View style={styles.collapsedContainer}>
      {recipient.phones.map((it, i) =>
        <View key={i} style={styles.row}>
          <FontAwesome5Icon name={"phone-alt"} style={styles.icon} />
          <UrlLink url={"tel:" + it}>
            <Text style={styles.phone}>{it}</Text>
          </UrlLink>
        </View>)
      }

      <View style={styles.row}>
        <FontAwesome5Icon name={"map-marker-alt"} solid style={styles.icon} />
        <View style={styles.address}>
          {!recipient.company ? undefined :
            <View style={styles.row}>
              <Text style={styles.addressLabel}>Company:</Text>
              <Text style={styles.addressValue}>{recipient.company}</Text>
            </View>
          }
          {!recipient.unit ? undefined :
            <View style={styles.row}>
              <Text style={styles.addressLabel}>Unit:</Text>
              <Text style={styles.addressValue}>{recipient.unit}</Text>
            </View>
          }
          {!recipient.address ? undefined :
            <View style={styles.row}>
              <Text style={styles.addressLabel}>Address:</Text>
              <UrlLink url={"geo:0,0?q=" + recipient.address} style={{ flex: 1 }}>
                <Text style={[styles.addressValue, styles.url]}>{recipient.address}</Text>
              </UrlLink>
            </View>
          }
        </View>
      </View>

      {!recipient.message ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"comment"} solid style={styles.icon} />
          <Text style={styles.message}>{recipient.message}</Text>
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
