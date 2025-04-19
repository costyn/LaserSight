interface NumberButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const MinusButton = ({ onClick, disabled }: NumberButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-3 py-1 rounded bg-blue-500 text-white"
    aria-label="Decrease value"
  >
    -
  </button>
);

const PlusButton = ({ onClick }: NumberButtonProps) => (
  <button
    onClick={onClick}
    className="px-3 py-1 rounded bg-blue-500 text-white"
    aria-label="Increase value"
  >
    +
  </button>
);

export { MinusButton, PlusButton };