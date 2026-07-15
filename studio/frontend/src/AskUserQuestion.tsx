// Interactive card for an AskUserQuestion permission.request: the agent's native "ask the human a
// multiple-choice question" tool. Renders each question as selectable options (plus a freeform
// "Other") instead of the generic permission card's raw-args view, and submits the picks as a
// question.answer so the model reads back its own choices rather than a "didn't answer" default.

import { useState } from "react";
import type { AskQuestionItem } from "./toolDetails";

interface QuestionState {
  selected: Set<string>;
  otherChecked: boolean;
  otherText: string;
}

function initState(questions: AskQuestionItem[]): QuestionState[] {
  return questions.map(() => ({ selected: new Set<string>(), otherChecked: false, otherText: "" }));
}

function isAnswered(s: QuestionState): boolean {
  return s.selected.size > 0 || (s.otherChecked && s.otherText.trim().length > 0);
}

// Indexed by position, not question text: the SDK's schema allows two questions with identical
// wording, and keying by text would collapse their controls into one. answers is still keyed by
// question text on the way out, matching AskUserQuestionOutput's own shape.
function buildAnswers(questions: AskQuestionItem[], state: QuestionState[]): Record<string, string> {
  const answers: Record<string, string> = {};
  questions.forEach((q, i) => {
    const s = state[i];
    const picks = [...s.selected];
    if (s.otherChecked && s.otherText.trim().length > 0) picks.push(s.otherText.trim());
    answers[q.question] = picks.join(", ");
  });
  return answers;
}

function Option({
  label,
  description,
  preview,
  multiSelect,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  preview?: string;
  multiSelect: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role={multiSelect ? "checkbox" : "radio"}
      aria-checked={checked}
      className={`ask__option ${checked ? "ask__option--checked" : ""}`}
      onClick={onToggle}
    >
      <span className={`ask__control ask__control--${multiSelect ? "checkbox" : "radio"}`} aria-hidden="true" />
      <span className="ask__option-body">
        <span className="ask__option-label">{label}</span>
        <span className="ask__option-desc">{description}</span>
        {preview && <pre className="ask__option-preview">{preview}</pre>}
      </span>
    </button>
  );
}

function Question({
  item,
  state,
  onChange,
}: {
  item: AskQuestionItem;
  state: QuestionState;
  onChange: (next: QuestionState) => void;
}) {
  const toggleOption = (label: string) => {
    if (item.multiSelect) {
      const selected = new Set(state.selected);
      if (selected.has(label)) selected.delete(label);
      else selected.add(label);
      onChange({ ...state, selected });
    } else {
      onChange({ ...state, selected: new Set([label]), otherChecked: false });
    }
  };

  const toggleOther = () => {
    if (item.multiSelect) onChange({ ...state, otherChecked: !state.otherChecked });
    else onChange({ ...state, selected: new Set(), otherChecked: !state.otherChecked });
  };

  return (
    <div className="ask__question">
      <div className="ask__question-head">
        <span className="ask__chip">{item.header}</span>
        <span className="ask__prompt">{item.question}</span>
      </div>
      <div className="ask__options">
        {item.options.map((opt) => (
          <Option
            key={opt.label}
            label={opt.label}
            description={opt.description}
            preview={opt.preview}
            multiSelect={item.multiSelect}
            checked={state.selected.has(opt.label)}
            onToggle={() => toggleOption(opt.label)}
          />
        ))}
        <div className="ask__other">
          <button
            type="button"
            role={item.multiSelect ? "checkbox" : "radio"}
            aria-checked={state.otherChecked}
            className={`ask__option ask__option--other ${state.otherChecked ? "ask__option--checked" : ""}`}
            onClick={toggleOther}
          >
            <span className={`ask__control ask__control--${item.multiSelect ? "checkbox" : "radio"}`} aria-hidden="true" />
            <span className="ask__option-label">Other</span>
          </button>
          {state.otherChecked && (
            <input
              type="text"
              className="ask__other-input"
              placeholder="Type your own answer…"
              autoFocus
              value={state.otherText}
              onChange={(e) => onChange({ ...state, otherText: e.target.value })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function AskUserQuestionCard({
  requestId,
  questions,
  onAnswer,
  onSkip,
}: {
  requestId: string;
  questions: AskQuestionItem[];
  onAnswer: (requestId: string, answers: Record<string, string>) => void;
  onSkip: (requestId: string) => void;
}) {
  const [state, setState] = useState(() => initState(questions));
  const allAnswered = state.every(isAnswered);

  return (
    <div className="ask">
      <div className="ask__head">
        <span className="ask__badge">question</span>
        <span className="ask__count">
          {questions.length > 1 ? `${questions.length} questions` : "1 question"}
        </span>
      </div>
      {questions.map((item, i) => (
        <Question
          key={i}
          item={item}
          state={state[i]}
          onChange={(next) => setState((prev) => prev.map((s, j) => (j === i ? next : s)))}
        />
      ))}
      <div className="ask__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!allAnswered}
          onClick={() => onAnswer(requestId, buildAnswers(questions, state))}
        >
          Submit
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => onSkip(requestId)}>
          Skip
        </button>
      </div>
    </div>
  );
}
