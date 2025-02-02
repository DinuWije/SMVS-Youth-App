import React, { useState } from "react";
import entityAPIClient from "../../APIClients/EntityAPIClient";

const UpdatePage = (): React.ReactElement => {
    const [file, setFile] = useState<File | null>(null);
    const onFileUploadClick = async () => {
        if (!file) {
          console.log("Please select a file to upload.");
          return;
        }
      
        const formData = new FormData();
        formData.append("body", JSON.stringify({
          string_field: "testString",
          int_field: 123,
          string_array_field: ["item1", "item2"],
          enum_field: "A",
          bool_field: true
        }));
        formData.append("file", file);
      
        try {
          const response = await entityAPIClient.create({ formData });
          if (response) {
            console.log("File and data uploaded successfully!");
          } else {
            console.log("File upload failed.");
          }
        } catch (error) {
          console.error("Error during file upload:", error);
        }
      };

  return (
    <div>
        <form>
          <input
            type="file"
            id="myFile"
            name="filename"
            onChange={(e) => {
              if (e.target.files) {
                setFile(e.target.files[0]); // Update file state
              }
            }}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={onFileUploadClick}
          >
            Upload File
          </button>
        </form>
      </div>
  );
};

export default UpdatePage;
