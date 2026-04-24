"use client";

import React from "react";

type BlockErrorBoundaryProps = {
  blockKey: string;
  blockType: string;
  children: React.ReactNode;
};

type BlockErrorBoundaryState = {
  hasError: boolean;
};

export class BlockErrorBoundary extends React.Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  state: BlockErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): BlockErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[BlockErrorBoundary] Block "${this.props.blockType}" crashed.`, error, info);
  }

  componentDidUpdate(prevProps: BlockErrorBoundaryProps) {
    if (
      this.state.hasError &&
      (prevProps.blockKey !== this.props.blockKey || prevProps.blockType !== this.props.blockType)
    ) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full rounded border border-brand/30 bg-brand/5 px-6 py-8 text-left">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">
            Section unavailable
          </p>
          <p className="mt-2 text-body text-foreground/70">
            The <strong>{this.props.blockType}</strong> block could not be rendered, so the rest of
            the page is still available.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
