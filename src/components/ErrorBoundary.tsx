import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught an error in ${this.props.name || 'component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: "10px",
            border: "1px solid #ff4444",
            backgroundColor: "rgba(255, 68, 68, 0.1)",
            color: "#ff4444",
            borderRadius: "4px",
            fontSize: "12px",
            margin: "4px"
          }}
        >
          <strong>Component Render Error</strong>
          {import.meta.env.DEV && (
            <div style={{ marginTop: "4px", opacity: 0.8, fontSize: "10px" }}>
              {this.state.error?.message}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
