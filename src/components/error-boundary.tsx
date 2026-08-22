import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { ErrorMessage } from "@/components/error-message";
import { useTheme } from "@/hooks/use-theme";
import { ErrorCode } from "@/types/appError";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

function ErrorFallback() {
  const theme = useTheme();

  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.bg }]}>
      <ErrorMessage code={ErrorCode.Unknown} />
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("ErrorBoundary", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
