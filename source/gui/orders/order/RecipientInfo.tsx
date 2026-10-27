import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../../theme";
import UrlLink from "../../utils/UrlLink";
import { Order } from "../../../logic/orders/models";
import Products from "./products/Products";
import Clipboard from "@react-native-clipboard/clipboard";
import { isAndroid } from "../../../logic/utils/utils";
import { Orders } from "../../../logic/orders/orders";
import { useSetRecoilState } from "recoil";
import { ordersState } from "../../../logic/recoil";

interface Props {
  order: Order;
}

const RecipientInfo: React.FC<Props> = ({ order }) => {
  const [collapsed, setCollapsed] = useState(true);
  const setAllOrders = useSetRecoilState(ordersState);

  const toggleCollapsed = () => {
    const willExpand = collapsed;
    setCollapsed(!collapsed);

    if (willExpand && order.products.some(p => !p._detailsLoaded)) {
      Orders.fetchDetailsForOrder(order)
        .then(updatedOrder => {
          setAllOrders(prevOrders => prevOrders.map(it => {
            if (it.id === updatedOrder.id) {
              return { ...updatedOrder, products: [...updatedOrder.products] };
            }
            return it;
          }));
        })
        .catch(() => {});
    }
  };

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
    <Pressable onPress={toggleCollapsed} style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}>
      <View style={styles.row}>
        <FontAwesome5Icon name={"user"} solid style={styles.icon} />
        <Text style={styles.name}>{Orders.recipientName(order)}</Text>

        {!order.recipient.specialInstructions ? undefined :
          <FontAwesome5Icon name={"exclamation-triangle"} solid style={[styles.icon, { color: "#f38300" }]} />}

        <FontAwesome5Icon name={collapsed ? "chevron-down" : "chevron-up"} style={styles.iconCollapse} />
      </View>
    </Pressable>

    {collapsed ? undefined : <View style={styles.collapsedContainer}>
      {order.recipient.phones
        .map((it, i) =>
          <View key={i} style={styles.row}>
            <FontAwesome5Icon name={"phone-alt"} style={styles.icon} />
            <UrlLink url={"tel:" + it.replace(/\s+/g, "")}>
              <Text style={styles.phone}>{it}</Text>
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
                <Text style={styles.addressValue}>{order.recipient.company}</Text>
              </View>
            }
            {!order.recipient.unit ? undefined :
              <View style={styles.row}>
                <Text style={styles.addressLabel}>Unit:</Text>
                <Text style={styles.addressValue}>{order.recipient.unit}</Text>
              </View>
            }
            {!order.recipient.address ? undefined :
              <View style={styles.row}>
                {!order.recipient.company && !order.recipient.unit ? undefined :
                  <Text style={styles.addressLabel}>Address:</Text>
                }
                <UrlLink url={Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" }) + encodeURIComponent(order.recipient.address)}
                         style={{ flex: 1 }}
                         onLongPress={copyAddress}>
                  <Text style={[styles.addressValue, styles.url]}>
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
          <FontAwesome5Icon name={"exclamation-triangle"} solid style={[styles.icon, { color: "#f38300" }]} />
          <View style={styles.specialInstructions}>
            <Text style={styles.specialInstructionsText}>{order.recipient.specialInstructions}</Text>
          </View>
        </View>
      }

      {!order.recipient.message ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"comment-dots"} solid style={styles.icon} />
          <View style={styles.message}>
            <Text style={styles.messageText}>{order.recipient.message}</Text>
          </View>
        </View>
      }

      <Products products={order.products} />
    </View>}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    flex: 1,
    fontWeight: "bold",
    color: lightColors.text,
  },
  phone: {
    color: lightColors.primary,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
    color: lightColors.text,
  },
  iconCollapse: {
    paddingHorizontal: 10,
    color: lightColors.text,
  },

  collapsedContainer: {
    paddingLeft: 10,
    paddingTop: 5,
  },
  address: {
    flex: 1,
    flexDirection: "column",
  },
  addressLabel: {
    color: lightColors.textLighter,
    marginRight: 5,
  },
  addressValue: {
    color: lightColors.text,
  },
  url: {
    color: lightColors.primary,
  },

  specialInstructions: {
    flex: 1,
  },
  specialInstructionsText: {
    color: "#ca6a00",
  },

  message: {
    flex: 1,
  },
  messageText: {
    fontStyle: "italic",
    color: lightColors.text,
  },
});

export default RecipientInfo;
