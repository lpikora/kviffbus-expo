import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { AppText } from "@/components/app-text";
import { ErrorCode } from "@/types/appError";

type ErrorMessageProps = {
  code: ErrorCode;
};

export function ErrorMessage({ code }: ErrorMessageProps) {
  const { t } = useTranslation();

  return <AppText style={styles.text}>{t(code)}</AppText>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
  },
});
