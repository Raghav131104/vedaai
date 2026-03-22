'use client';
import { useEffect, useRef } from 'react';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { JobUpdate } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export function useWebSocket(jobId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const { handleJobUpdate, setWsConnected } = useAssignmentStore();

  useEffect(() => {
    if (!jobId) return;

    const ws = new WebSocket(`${WS_URL}/ws?jobId=${jobId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      console.log('WebSocket connected for job:', jobId);
    };

    ws.onmessage = (event) => {
      try {
        const update: JobUpdate = JSON.parse(event.data);
        handleJobUpdate(update);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
      setWsConnected(false);
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [jobId]);

  return wsRef;
}
