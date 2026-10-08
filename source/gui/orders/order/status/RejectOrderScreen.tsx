import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { lightColors } from "../../../theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamList, Routes } from "../../../../routes";
import { Orders } from "../../../../logic/orders/orders";
import { Order } from "../../../../logic/orders/models";
import RejectReasonComponent from "./RejectReasonComponent";
import { useOrderAction } from "./utils";
import { useRecoilState, useRecoilValue } from "recoil";
import { orderActionInProgressState, ordersState } from "../../../../logic/recoil";
import LoadingOverlay from "../../../utils/LoadingOverlay";
import { BloomableApi } from "../../../../logic/bloomable/api";
import CustomRejectReasonInput from "./CustomRejectReasonInput";
import { settings } from "../../../../logic/settings/settings";
import { rollbar, sanitizeErrorForRollbar } from "../../../../logic/rollbar";

const RejectOrderScreen: React.FC<NativeStackScreenProps<ParamList, typeof Routes.RejectOrder>> = ({
                                                                                                     navigation,
                                                                                                     route,
                                                                                                   }) => {
  const orders = useRecoilValue(ordersState);
  const order = orders.find(it => it.id === route.params.orderId)!;

  const [orderActionInProgress, setOrderActionInProgress] = useRecoilState(orderActionInProgressState);
  const [defaultRejectReasons, setDefaultRejectReasons] = useState<string[]>([]);
  const [isProcessing, applyOrderAction, setIsProcessing] = useOrderAction(order);
  const [selectedReason, setSelectedReason] = useState<string | undefined>(undefined);
  const [customReason, setCustomReason] = useState<string>("");

  const loadReasons = useCallback(() => {
    setIsProcessing(true);
    BloomableApi.getRejectReasons()
      .then(setDefaultRejectReasons)
      .finally(() => setIsProcessing(false));
  }, []);

  useEffect(() => {
    loadReasons();
  }, []);

  const closeScreen = () => navigation.pop();

  const submit = () => {
    if (selectedReason === undefined) return;
    if (settings.disableOrderActions) return;
    setIsProcessing(true);

    Orders.reject(order, selectedReason === "Other" ? customReason.trim() : selectedReason)
      .then(() => Orders.checkIsDeleted(order)
        .then(isDeleted => {
          order.isProcessing = false;
          order.status = isDeleted ? "rejected" : order.status;

          // Trigger GUI update
          setOrderActionInProgress(true);
          setOrderActionInProgress(false);
        }))
      .catch(error => {
        rollbar.error("Failed to mark order as rejected.", { ...sanitizeErrorForRollbar(error), order: order });
        Alert.alert("Reject order", `Failed to mark order as rejected.\n\n${error}.`);
        return false;
      })
      .finally(() => {
        setIsProcessing(false);
      })
      .then(success => {
        if (!success) return;
        navigation.pop();
      });
  };

  return <View style={{ flex: 1 }}>
    <LoadingOverlay isVisible={isProcessing} />
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <Text style={styles.text}>Order {order.number} for {Orders.recipientName(order as Order)}.</Text>
      <Text style={styles.text} />
      <Text style={styles.text}>Why do you want to reject this order?</Text>

      <View style={styles.list}>
        {defaultRejectReasons.length === 0 ?
          <Text style={[styles.text, styles.errorText]}>No reasons loaded.</Text> : null}
        {defaultRejectReasons.map(it =>
          <RejectReasonComponent key={it}
                                 text={it}
                                 isSelected={it === selectedReason}
                                 onSelect={setSelectedReason} />)}
        <RejectReasonComponent text={"Other"}
                               isSelected={selectedReason === "Other"}
                               onSelect={setSelectedReason} />
        {selectedReason !== "Other" ? null :
          <CustomRejectReasonInput value={customReason}
                                   onChange={setCustomReason} />}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.button} onPress={closeScreen}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, (selectedReason === undefined ? styles.buttonDisabled : {})]}
          disabled={selectedReason === undefined}
          onPress={submit}>
          <Text style={[styles.buttonText, styles.buttonPrimaryText]}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightColors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
  },
  text: {
    fontSize: 16,
    color: lightColors.text,
  },
  errorText: {
    color: lightColors.textError,
    paddingBottom: 10,
  },
  list: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: lightColors.text,
    fontWeight: "bold",
  },
  buttonPrimary: {
    backgroundColor: lightColors.primary,
  },
  buttonPrimaryText: {
    color: lightColors.onPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default RejectOrderScreen;
