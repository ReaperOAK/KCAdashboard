import React, { useState } from 'react';
import { Button, Table, Upload, message } from 'antd';
import { UploadOutlined, ShareAltOutlined, DeleteOutlined } from '@ant-design/icons';

const PGNDatabase = () => {
  const [pgns, setPgns] = useState([]);

  const fetchPGNs = async () => {
    try {
      const response = await fetch('/php/getPGNs.php');
      const data = await response.json();
      setPgns(data);
    } catch (error) {
      message.error('Failed to load PGN files');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
    },
    {
      title: 'Shared With',
      dataIndex: 'sharedWith',
      key: 'sharedWith',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button 
            icon={<ShareAltOutlined />}
            onClick={() => handleShare(record.id)}
          >
            Share
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('pgn', file);
      const response = await fetch('/php/uploadPGN.php', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        message.success(`${file.name} uploaded successfully`);
        fetchPGNs();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Upload failed: ${error.message}`);
    }
    return false; // Prevent default upload behavior
  };

  const handleShare = async (id) => {
    try {
      const response = await fetch('/php/sharePGN.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        message.success('PGN shared successfully');
        fetchPGNs();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Share failed: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch('/php/deletePGN.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        message.success('PGN deleted successfully');
        fetchPGNs();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Delete failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">PGN Database</h1>
        <Upload
          beforeUpload={handleUpload}
          accept=".pgn"
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} type="primary">
            Upload PGN
          </Button>
        </Upload>
      </div>

      <Table
        columns={columns}
        dataSource={pgns}
        rowKey="id"
        className="bg-white rounded-lg shadow"
      />
    </div>
  );
};

export default PGNDatabase;