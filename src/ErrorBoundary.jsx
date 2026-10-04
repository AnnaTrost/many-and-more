// Crash screen shown instead of a blank page if a screen throws.
import React from "react";
import { clearSave } from "./save";

/* Crash screen:
   If any screen throws while rendering, show this instead of a blank page. "Back to chapters" remounts
   the game on the map, which recovers from almost anything, since crashes are usually local to one screen.
   Erasing the save is the last resort, behind a second click. */
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null, attempt: 0, confirm: false }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("Many, and more crashed:", error, info && info.componentStack); }
  restart(erase) {
    if (erase) clearSave();
    this.setState(s => ({ error: null, confirm: false, attempt: s.attempt + 1 }));
  }
  render() {
    const { error, attempt, confirm } = this.state;
    if (!error) return <React.Fragment key={attempt}>{this.props.children}</React.Fragment>;
    return (
      <div className="crash" role="alert">
        <h2>Something went wrong</h2>
        <p>The game hit a problem on this screen. Your saved progress hasn't been touched.</p>
        <div className="row">
          <button className="btn" onClick={() => this.restart(false)}>Back to chapters</button>
          {confirm
            ? <span className="reset-confirm">This erases every chapter you've finished.
                <button className="linkish" onClick={() => this.restart(true)}>Yes, erase it</button>
                <button className="linkish" onClick={() => this.setState({ confirm: false })}>Keep it</button></span>
            : <button className="linkish" onClick={() => this.setState({ confirm: true })}>Still stuck? Erase progress and start over</button>}
        </div>
        <details className="formal"><summary>Details for the developer</summary>
          <div><p><code>{String((error && error.message) || error)}</code></p></div></details>
      </div>
    );
  }
}
