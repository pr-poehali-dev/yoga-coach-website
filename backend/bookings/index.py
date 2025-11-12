'''
Business: API для управления расписанием йога-занятий и бронированиями
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами: request_id, function_name
Returns: HTTP response dict с данными расписания или результатом бронирования
'''

import json
import os
from typing import Dict, Any, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action', 'schedule')
            
            if action == 'schedule':
                cursor.execute('''
                    SELECT 
                        cs.id,
                        cs.start_time,
                        cs.end_time,
                        cs.available_spots,
                        yc.title,
                        yc.description,
                        yc.duration,
                        yc.price,
                        (SELECT COUNT(*) FROM bookings WHERE schedule_id = cs.id AND status = 'confirmed') as booked_count
                    FROM class_schedule cs
                    JOIN yoga_classes yc ON cs.class_id = yc.id
                    WHERE cs.start_time >= NOW()
                    ORDER BY cs.start_time
                ''')
                
                schedule = cursor.fetchall()
                
                result = []
                for item in schedule:
                    result.append({
                        'id': item['id'],
                        'title': item['title'],
                        'description': item['description'],
                        'start_time': item['start_time'].isoformat(),
                        'end_time': item['end_time'].isoformat(),
                        'duration': item['duration'],
                        'price': float(item['price']),
                        'available_spots': item['available_spots'],
                        'booked_count': item['booked_count'],
                        'spots_left': item['available_spots'] - item['booked_count']
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'schedule': result})
                }
            
            elif action == 'classes':
                cursor.execute('SELECT * FROM yoga_classes ORDER BY title')
                classes = cursor.fetchall()
                
                result = []
                for cls in classes:
                    result.append({
                        'id': cls['id'],
                        'title': cls['title'],
                        'description': cls['description'],
                        'duration': cls['duration'],
                        'max_participants': cls['max_participants'],
                        'price': float(cls['price'])
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'classes': result})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            schedule_id = body_data.get('schedule_id')
            client_name = body_data.get('client_name')
            client_email = body_data.get('client_email')
            client_phone = body_data.get('client_phone', '')
            
            if not all([schedule_id, client_name, client_email]):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Заполните все обязательные поля'})
                }
            
            cursor.execute('''
                SELECT cs.available_spots,
                       (SELECT COUNT(*) FROM bookings WHERE schedule_id = cs.id AND status = 'confirmed') as booked_count
                FROM class_schedule cs
                WHERE cs.id = %s
            ''', (schedule_id,))
            
            slot_info = cursor.fetchone()
            
            if not slot_info:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Занятие не найдено'})
                }
            
            if slot_info['booked_count'] >= slot_info['available_spots']:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Нет свободных мест'})
                }
            
            cursor.execute('''
                INSERT INTO bookings (schedule_id, client_name, client_email, client_phone, status)
                VALUES (%s, %s, %s, %s, 'confirmed')
                RETURNING id
            ''', (schedule_id, client_name, client_email, client_phone))
            
            booking_id = cursor.fetchone()['id']
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'booking_id': booking_id,
                    'message': 'Вы успешно записаны на занятие!'
                })
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
