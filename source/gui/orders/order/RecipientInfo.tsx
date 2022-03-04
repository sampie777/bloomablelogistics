import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../../theme";
import UrlLink from "../../utils/UrlLink";
import { Order } from "../../../logic/models";
import { Orders } from "../../../logic/orders";
import Products from "./products/Products";

interface Props {
  order: Order;
  onRecipientUpdated?: () => void;
}

const RecipientInfo: React.FC<Props> = ({ order, onRecipientUpdated }) => {
  const isMounted = useRef(false);
  const [collapsed, setCollapsed] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    isMounted.current = true;
    if (order.recipient === undefined) {
      fetchRecipient();
    }
    return () => {
      isMounted.current = false;
    };
  }, [order.id]);

  const fetchRecipient = () => {
    setIsProcessing(true);
    setErrorMessage(undefined);

    Orders.fetchDetailsForOrder(order)
      .then(() => {
        if (!isMounted.current) {
          return;
        }

        onRecipientUpdated?.();
      })
      .catch(error => {
        if (!isMounted.current) {
          return;
        }
        setErrorMessage(error.toString());
      })
      .finally(() => {
        if (!isMounted.current) {
          return;
        }
        setIsProcessing(false);
      });
  };

  if (!order.recipient) {
    return <View style={[styles.container, styles.loadingContainer]}>
      {!isProcessing ? undefined :
        <ActivityIndicator style={styles.loading} color={styles.loading.color} />
      }

      {errorMessage === undefined ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"exclamation-circle"} solid style={[styles.icon, styles.error]} />
          <Text style={styles.error}>{errorMessage}</Text>
        </View>
      }
    </View>;
  }

  return <View style={styles.container}>
    <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
      <View style={styles.row}>
        <FontAwesome5Icon name={"user"} solid style={styles.icon} />
        <Text style={styles.name} selectable={true}>{order.recipient.name}</Text>

        {!order.recipient.specialInstructions ? undefined :
          <FontAwesome5Icon name={"exclamation-triangle"} solid style={[styles.icon, { color: "#f38300" }]} />}

        <FontAwesome5Icon name={collapsed ? "chevron-down" : "chevron-up"} />
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
              <Text style={styles.addressLabel}>Address:</Text>
              <UrlLink url={Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" }) + order.recipient.address}
                       style={{ flex: 1 }}>
                <Text style={[styles.addressValue, styles.url]}
                      selectable={true}>
                  {order.recipient.address}
                </Text>
              </UrlLink>
            </View>
          }
        </View>
      </View>

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
  loadingContainer: {
    flexDirection: "column",
    justifyContent: "center",
    paddingVertical: 5,
  },
  loading: {
    alignSelf: "center",
    color: lightColors.text,
    paddingVertical: 4,
  },
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
