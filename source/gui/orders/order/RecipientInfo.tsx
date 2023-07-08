import React, { useState } from "react";
import { Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../../theme";
import UrlLink from "../../utils/UrlLink";
import { Order } from "../../../logic/orders/models";
import Products from "./products/Products";
import Clipboard from "@react-native-clipboard/clipboard";
import { isAndroid } from "../../../logic/utils";

interface Props {
  order: Order;
}

const RecipientInfo: React.FC<Props> = ({ order }) => {
  const [collapsed, setCollapsed] = useState(true);

  const copyAddress = () => {
    if (!order.recipient.address) {
      return;
    }
    Clipboard.setString(order.recipient.address);

    if (isAndroid) {
      ToastAndroid.showWithGravity("Address copied!", ToastAndroid.SHORT, ToastAndroid.CENTER);
    }
  };

  return <View style={styles.container}>
    <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
      <View style={styles.row}>
        <FontAwesome5Icon name={"user"} solid style={styles.icon} />
        <Text style={styles.name} selectable={true}>{order.recipient.name}</Text>

        {!order.recipient.specialInstructions ? undefined :
          <FontAwesome5Icon name={"exclamation-triangle"} solid style={[styles.icon, { color: "#f38300" }]} />}

        <FontAwesome5Icon name={collapsed ? "chevron-down" : "chevron-up"} style={styles.iconCollapse} />
      </View>
    </TouchableOpacity>

    {collapsed ? undefined : <View style={styles.collapsedContainer}>
      {order.recipient.phones
        .map((it, i) =>
          <View key={i} style={styles.row}>
            <FontAwesome5Icon name={"phone-alt"} style={styles.icon} />
            <UrlLink url={"tel:" + it}>
              <Text style={styles.phone} selectable={true}>{it}</Text>
            </UrlLink>
          </View>)
      }

      {!(order.recipient.company || order.recipient.unit || order.recipient.address) ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"map-marker-alt"} solid style={styles.icon} />
          <View style={styles.address}>
            {!order.recipient.company ? undefined :
              <View style={styles.row}>
                <Text style={styles.addressLabel}>Company:</Text>
                <Text style={styles.addressValue} selectable={true}>{order.recipient.company}</Text>
              </View>
            }
            {!order.recipient.unit ? undefined :
              <View style={styles.row}>
                <Text style={styles.addressLabel}>Unit:</Text>
                <Text style={styles.addressValue} selectable={true}>{order.recipient.unit}</Text>
              </View>
            }
            {!order.recipient.address ? undefined :
              <View style={styles.row}>
                {!order.recipient.company && !order.recipient.unit ? undefined :
                  <Text style={styles.addressLabel}>Address:</Text>
                }
                <UrlLink url={Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" }) + order.recipient.address}
                         style={{ flex: 1 }}
                         onLongPress={copyAddress}>
                  <Text style={[styles.addressValue, styles.url]}
                        selectable={true}>
                    {order.recipient.address}
                  </Text>
                </UrlLink>
              </View>
            }
          </View>
        </View>
      }

      {!order.recipient.specialInstructions ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"exclamation-triangle"} solid style={styles.icon} />
          <Text style={styles.specialInstructions} selectable={true}>{order.recipient.specialInstructions}</Text>
        </View>
      }

      {!order.recipient.message ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"comment"} solid style={styles.icon} />
          <Text style={styles.message} selectable={true}>{order.recipient.message}</Text>
        </View>
      }

      <Products products={order.products} />
    </View>}
  </View>;
};

const styles = StyleSheet.create({
  container: {},
  error: {
    color: "#800",
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
    color: lightColors.text,
  },
  iconCollapse: {
    color: lightColors.text,
  },

  name: {
    flex: 1,
    paddingVertical: 8,
    fontWeight: "bold",
    color: lightColors.text,
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
    color: lightColors.text,
  },
  addressValue: {
    flex: 1,
    color: lightColors.text,
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
    color: lightColors.text,
  },

  message: {
    flex: 1,
    borderWidth: 1,
    borderColor: lightColors.borderVariant,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: lightColors.surface2,
    color: lightColors.text,
  },

  url: {
    color: lightColors.url,
  },
});

export default RecipientInfo;
