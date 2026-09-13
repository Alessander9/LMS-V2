import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/chatbot';

  sendMessage(message: string, history: ChatMessage[]): Observable<ChatResponse> {
    const request: ChatRequest = { message, history };
    return this.http.post<ChatResponse>(this.apiUrl, request);
  }
}
