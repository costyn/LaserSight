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
    -1
  </button>
);

const PlusButton = ({ onClick }: NumberButtonProps) => (
  <button
    onClick={onClick}
    className="px-3 py-1 rounded bg-blue-500 text-white"
    aria-label="Increase value"
  >
    +1
  </button>
);

export { MinusButton, PlusButton };