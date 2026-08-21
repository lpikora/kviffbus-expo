import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet } from "react-native";

import { ErrorMessage } from "@/components/error-message";
import { ThemedView } from "@/components/themed-view";
import { ErrorCode } from "@/types/appError";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

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
      return (
        <ThemedView style={styles.fallback}>
          <ErrorMessage code={ErrorCode.Unknown} />
        </ThemedView>
      );
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
