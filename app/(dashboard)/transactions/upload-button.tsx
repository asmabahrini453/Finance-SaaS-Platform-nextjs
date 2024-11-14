 // {/* upload file csv */}
import { Upload } from "lucide-react";
import { useCSVReader } from "react-papaparse";

import { Button } from "@/components/ui/button";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpload: (result: any) => void;
};

export const UploadButton = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();

  return (
    <CSVReader onUploadAccepted={onUpload}>
       {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {({ getRootProps }: any) => (
        <Button size="sm" className="w-full lg:w-auto" {...getRootProps()}>
          {/* icon  */}
          <Upload className="size-4 mr-2" />
          Import CSV
        </Button>
      )}
    </CSVReader>
  );
};
