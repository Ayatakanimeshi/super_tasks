export default function ErrorMessage(props: { message?: string }) {
  return (
    <div className="text-sm text-red-600">
      {props.message ?? "エラーが発生しました"}
    </div>
  );
}
