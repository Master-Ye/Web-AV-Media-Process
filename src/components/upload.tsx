import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, message, Upload } from 'antd';

// const props: UploadProps = {
//   name: 'file',
//   action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
//   headers: {
//     authorization: 'authorization-text',
//   },
//   onChange(info) {
//     if (info.file.status !== 'uploading') {
//       console.log(info.file, info.fileList);
//     }
//     if (info.file.status === 'done') {
//       message.success(`${info.file.name} file uploaded successfully`);
//     } else if (info.file.status === 'error') {
//       message.error(`${info.file.name} file upload failed.`);
//     }
//   },
// };
interface props {
  onFileChange: (file:ReadableStream|null) => void,
  maxCount: number,
  fileType: Array<string>
}



const App = (props: props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([
  ]);

  const onChange = (e) => {
    console.log(e)

    if(!e.fileList.length)
    {
      props.onFileChange(null)
      setFileList([])
      return
    }
    const file = e.file
    if (!props.fileType.includes(file.type)) {
      message.error('not')
      return
    }
    props.onFileChange(file.stream())
    setFileList([file])
  }
  return (
    <Upload maxCount={props.maxCount} beforeUpload={() => false} onChange={onChange} fileList={fileList}>
      <Button icon={<UploadOutlined />}>Click to Upload</Button>
    </Upload>
  );
}

export default App;