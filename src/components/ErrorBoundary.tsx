import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Uncaught render error:", error, info);
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    const isDev = import.meta.env.DEV;
    const message = error.message || String(error);
    const stack = error.stack || "";
    const componentStack = info?.componentStack || "";

    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-12">
        <div className="max-w-2xl w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-headline font-black tracking-tight mb-2">
                Something went wrong
              </h1>
              <p className="text-on-surface-variant/80 text-sm leading-relaxed">
                The page hit an unexpected error and could not render. Your data is safe — try again, reload, or head back home.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-6">
            <p className="text-xs font-label uppercase tracking-widest text-red-400 font-bold mb-2">
              Error
            </p>
            <p className="text-sm font-mono break-words text-foreground">{message}</p>
          </div>

          {isDev && (stack || componentStack) && (
            <details className="mb-6 rounded-xl border border-outline-variant/20 bg-surface-container-lowest/60 p-4 text-xs">
              <summary className="cursor-pointer font-bold text-on-surface-variant">
                Stack trace (dev only)
              </summary>
              {stack && (
                <pre className="mt-3 overflow-auto max-h-64 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-on-surface-variant/80">
                  {stack}
                </pre>
              )}
              {componentStack && (
                <pre className="mt-3 overflow-auto max-h-64 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-on-surface-variant/60">
                  Component stack:{componentStack}
                </pre>
              )}
            </details>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={this.handleReset}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:shadow-[0_0_20px_hsla(82,98%,72%,0.3)] transition-all"
            >
              Try again
            </button>
            <button
              onClick={this.handleReload}
              className="border border-outline-variant/30 text-foreground px-5 py-2.5 rounded-lg font-bold text-sm hover:border-primary hover:text-primary transition-all"
            >
              Reload page
            </button>
            <button
              onClick={this.handleHome}
              className="text-on-surface-variant hover:text-primary px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
            >
              ← Back home
            </button>
          </div>

          {!isDev && (
            <p className="mt-6 text-xs text-on-surface-variant/50">
              If this keeps happening, please{" "}
              <a href="/contact-us" className="text-primary hover:underline">contact support</a>{" "}
              with a copy of the error message above.
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
