import Modal from "./Modal";

export default function ConfirmDialog(props: {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}) {
  const { open, message, onCancel, onConfirm, confirmText, cancelText } = props;
  return (
    <Modal open={open} onClose={onCancel} title="確認">
      <p>{message}</p>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 rounded border" onClick={onCancel}>
          {cancelText ?? "キャンセル"}
        </button>
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={onConfirm}
        >
          {confirmText ?? "OK"}
        </button>
      </div>
    </Modal>
  );
}
