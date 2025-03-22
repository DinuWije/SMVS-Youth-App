import os
import requests
import json
from ...models import db 
from ...models.reflection import Reflection
from ..interfaces.reflection_service import IReflectionService

class ReflectionService(IReflectionService):
    def __init__(self, logger):
        super().__init__(logger)
        self.cohere_api_key = os.getenv("COHERE_API_KEY")
        self.cohere_api_url = "https://api.cohere.ai/v1/chat"

    def get_all_reflections(self, user_id):
        """Get all reflections for a specific user."""
        try:
            reflections = Reflection.query.filter_by(user_id=user_id).order_by(Reflection.created_at.desc()).all()
            return [reflection.to_dict() for reflection in reflections]
        except Exception as e:
            self.logger.error(f"Error retrieving reflections: {str(e)}")
            raise

    def get_recent_reflections(self, user_id, limit=5):
        """Get recent reflections for a specific user."""
        try:
            reflections = Reflection.query.filter_by(user_id=user_id).order_by(Reflection.created_at.desc()).limit(limit).all()
            return [reflection.to_dict() for reflection in reflections]
        except Exception as e:
            self.logger.error(f"Error retrieving recent reflections: {str(e)}")
            raise

    def get_reflection_by_id(self, reflection_id, user_id=None):
        """Get a reflection by ID, optionally filtering by user_id."""
        try:
            query = Reflection.query.filter_by(id=reflection_id)
            if user_id is not None:
                query = query.filter_by(user_id=user_id)
            
            reflection = query.first()
            return reflection.to_dict() if reflection else None
        except Exception as e:
            self.logger.error(f"Error retrieving reflection {reflection_id}: {str(e)}")
            raise

    def create_reflection(self, reflection_data):
        """Create a new reflection."""
        try:
            reflection = Reflection(**reflection_data)
            db.session.add(reflection)
            db.session.commit()
            return reflection.to_dict()
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error creating reflection: {str(e)}")
            raise

    def update_reflection(self, reflection_id, reflection_data, user_id=None):
        """Update an existing reflection."""
        try:
            query = Reflection.query.filter_by(id=reflection_id)
            if user_id is not None:
                query = query.filter_by(user_id=user_id)
                
            reflection = query.first()
            if not reflection:
                return None

            for key, value in reflection_data.items():
                if hasattr(reflection, key) and key != 'id':
                    setattr(reflection, key, value)

            db.session.commit()
            return reflection.to_dict()
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error updating reflection {reflection_id}: {str(e)}")
            raise

    def delete_reflection(self, reflection_id, user_id=None):
        """Delete a reflection."""
        try:
            query = Reflection.query.filter_by(id=reflection_id)
            if user_id is not None:
                query = query.filter_by(user_id=user_id)
                
            reflection = query.first()
            if not reflection:
                return False

            db.session.delete(reflection)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error deleting reflection {reflection_id}: {str(e)}")
            raise

    def save_reflection(self, reflection_id, user_id):
        """Mark a reflection as saved."""
        try:
            reflection = Reflection.query.filter_by(id=reflection_id, user_id=user_id).first()
            if not reflection:
                return None

            reflection.saved = True
            db.session.commit()
            return reflection.to_dict()
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error saving reflection {reflection_id}: {str(e)}")
            raise
    
    def _get_preamble_for_reflection(self, reflection_type):

        base_preamble = "You are a compassionate wellness assistant specialized in..."
    
        # Add specific formatting instructions
        formatting_guide = (
            " Provide a complete, thoughtful response that's 2-3 sentences long. "
            "Always end with a single thought-provoking question. "
            "Your entire response must be under 150 words."
        )
        """Get the appropriate preamble for the Cohere model based on reflection type."""
        preambles = {
            "gratitude": "You are a compassionate wellness assistant specialized in gratitude practices. Your role is to help users deepen their gratitude reflections. Provide thoughtful, empathetic responses that encourage deeper reflection and personal growth. Keep responses concise (under 100 words) and end with a thought-provoking question about gratitude or appreciation." + formatting_guide,
            
            "stress": "You are a compassionate wellness assistant specialized in stress management. Your role is to help users process and cope with stress healthily. Provide thoughtful, empathetic responses that acknowledge their feelings while suggesting gentle coping mechanisms. Keep responses concise (under 100 words) and end with a thought-provoking question about managing stress or finding calm."  + formatting_guide,
            
            "goals": "You are a compassionate wellness assistant specialized in goal-setting and achievement. Your role is to help users clarify their aspirations and take meaningful steps forward. Provide thoughtful, empathetic responses that encourage reflection on progress and potential. Keep responses concise (under 100 words) and end with a thought-provoking question about their goals or next steps."  + formatting_guide,
            
            "meditation": "You are a compassionate wellness assistant specialized in meditation practice. Your role is to help users deepen their understanding of their meditation experiences. Provide thoughtful, empathetic responses that validate their practice and encourage deeper awareness. Keep responses concise (under 100 words) and end with a thought-provoking question about their meditation journey."  + formatting_guide,
            
            "emotion": "You are a compassionate wellness assistant specialized in emotional awareness. Your role is to help users understand and process their feelings without judgment. Provide thoughtful, empathetic responses that validate their emotions and encourage self-compassion. Keep responses concise (under 100 words) and end with a thought-provoking question about emotional awareness or regulation."  + formatting_guide
        }
        
        return preambles.get(reflection_type, preambles["gratitude"])

    def get_reflection_prompt(self, reflection_type):
        """Get a prompt for the reflection type."""
        prompts = {
            "gratitude": [
                "What are three things you're grateful for today?",
                "Who has positively impacted your life recently, and how?",
                "What simple pleasure brought you joy today?",
                "What aspect of your health are you thankful for?",
                "What opportunity are you currently grateful for?"
            ],
            "stress": [
                "What's causing you the most stress right now?",
                "How is stress showing up in your body today?",
                "What's one small step you could take to reduce your stress?",
                "What boundaries might you need to set to protect your peace?",
                "What activities help you feel calm when you're stressed?"
            ],
            "goals": [
                "What's one goal you're working toward right now?",
                "What's a small win you've experienced recently?",
                "What obstacle is currently challenging you?",
                "What habit would most help you achieve your current goals?",
                "What does success look like to you this month?"
            ],
            "meditation": [
                "What insights arose during your recent meditation?",
                "How has meditation affected your daily awareness?",
                "What distractions do you notice most during meditation?",
                "How does your body feel before and after meditation?",
                "What emotions surfaced during your meditation practice?"
            ],
            "emotion": [
                "What emotion has been most present for you today?",
                "When did you feel most alive or energized recently?",
                "What triggered a strong emotional response from you lately?",
                "How do you typically respond to difficult emotions?",
                "What emotion would you like to cultivate more of in your life?"
            ]
        }
        
        import random
        return random.choice(prompts.get(reflection_type, prompts["gratitude"]))

    def generate_ai_response(self, user_reflection, reflection_type):
        """Generate an AI response to the user's reflection using Cohere API."""
        try:
            if not self.cohere_api_key:
                self.logger.warning("Cohere API key not configured, using mock response")
                return self._get_mock_ai_response(reflection_type)
                
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.cohere_api_key}",
                "Accept": "application/json"
            }
            
            payload = {
                "message": user_reflection,
                "model": "command",
                "preamble": self._get_preamble_for_reflection(reflection_type),
                "temperature": 0.7,
                "stop_sequences": ["\n\n"]
            }
            
            response = requests.post(self.cohere_api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if "text" in result:
                print(result["text"])
                return result["text"]
            else:
                self.logger.error(f"Unexpected API response format: {result}")
                return self._get_mock_ai_response(reflection_type)
                
        except Exception as e:
            self.logger.error(f"Error generating AI response: {str(e)}")
            return self._get_mock_ai_response(reflection_type)
    
    def _get_mock_ai_response(self, reflection_type):
        """Provide a mock AI response for when the API is unavailable."""
        responses = {
            "gratitude": "Gratitude is a powerful practice that can shift our perspective. Noticing the good things, even small ones, can build resilience over time. What's one thing you're grateful for that you might typically overlook?",
            "stress": "It sounds like you're navigating some challenges right now. Remember that acknowledging stress is an important step in managing it. What's one small act of self-care you could practice today?",
            "goals": "Setting intentions and working toward meaningful goals helps create purpose and direction. Breaking large goals into smaller steps can make progress more visible. What's one tiny step you could take today?",
            "meditation": "Your meditation practice is creating space for awareness and insight. Each session, even the challenging ones, contributes to your growth. What patterns are you beginning to notice through your practice?",
            "emotion": "Emotions provide valuable information about our needs and values. By acknowledging them without judgment, we gain deeper self-understanding. How might this emotion be trying to guide you right now?"
        }
        
        return responses.get(reflection_type, responses["gratitude"])
