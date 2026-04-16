import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCcw, AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Application Error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#fafaf8] z-[9999] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[48px] p-12 shadow-2xl border border-black/5 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 shadow-inner animate-pulse">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            
            <h2 className="text-3xl font-black tracking-tight text-black mb-4">系統暫時休息中</h2>
            
            <p className="text-sm font-medium text-black/40 mb-10 leading-relaxed">
              很抱歉，應用程式遇到了一個預期外的錯誤。<br />
              您的資料已經安全儲存，請嘗試重新整理。
            </p>

            <div className="flex flex-col gap-4 w-full">
              <button 
                className="w-full py-5 bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-[12px] shadow-xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                onClick={this.handleReload}
              >
                <RefreshCcw size={18} />
                強制重新整理 (Reload)
              </button>
              
              <button 
                className="w-full py-4 bg-black/5 text-black/40 rounded-[24px] font-bold text-[11px] hover:bg-black/10 transition-colors"
                onClick={this.handleReset}
              >
                試著回到前一頁 (Try Recovery)
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-black/5 rounded-2xl text-left w-full overflow-hidden">
                <p className="text-[10px] font-mono text-black/60 break-all">{this.state.error.message}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
