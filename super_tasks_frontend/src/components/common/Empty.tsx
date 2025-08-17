export default function Empty(props: { children?: React.ReactNode }) {
  return (
    <div className="text-sm opacity-70">
      {props.children ?? "データがありません"}
    </div>
  );
}
