import {
  QrcodeGenerator,
  QrcodeGeneratorProps,
} from "@/components/QrcodeGenerator";
import React from "react";

export default function QrcodeGeneratorWithProvider<P extends {}>(
  props: QrcodeGeneratorProps<P>,
) {
  return <QrcodeGenerator {...props} />;
}
