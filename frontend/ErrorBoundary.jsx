import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 ERROR BOUNDARY CAUGHT:', error);
    console.error('🔥 ERROR INFO:', errorInfo);
    console.error('🔥 ERROR STACK:', error.stack);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ff4444', 
          color: 'white',
          fontFamily: 'monospace'
        }}>
          <h1>🚨 ERROR CAUGHT BY BOUNDARY</h1>
          <details>
            <summary>Error Details (click to expand)</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <pre>{this.state.errorInfo.componentStack}</pre>
          </details>
          <p>Check console for full error details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
