import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, notification } from 'antd';
import { CalendarOutlined, TrophyOutlined } from '@ant-design/icons';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/php/tournaments/get_tournaments.php');
      const data = await response.json();
      if (data.success) {
        setTournaments(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to fetch tournaments'
      });
    }
    setLoading(false);
  };

  const handleRegister = async (tournamentId) => {
    try {
      const formData = new FormData();
      formData.append('tournament_id', tournamentId);

      const response = await fetch('/php/tournaments/register_tournament.php', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        notification.success({
          message: 'Success',
          description: data.message
        });
        fetchTournaments();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to register for tournament'
      });
    }
  };

  const columns = [
    {
      title: 'Tournament',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <TrophyOutlined style={{ color: '#461fa3', marginRight: 8 }} />
          {text}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <span>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {date}
        </span>
      ),
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'Open' ? 'green' :
          status === 'In Progress' ? 'blue' :
          'red'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          disabled={record.status !== 'Open'}
          onClick={() => handleRegister(record.id)}
          style={{ backgroundColor: '#200e4a' }}
        >
          Register
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={<h1 className="text-2xl font-bold text-[#200e4a]">Chess Tournaments</h1>}
        className="shadow-lg"
      >
        <Table
          columns={columns}
          dataSource={tournaments}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Tournaments;