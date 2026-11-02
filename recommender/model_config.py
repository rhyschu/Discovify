"""Independent model credentials for explicit provider selection."""
import os


def model_config():
    provider=os.getenv('MODEL_PROVIDER','openai').strip().lower()
    if provider=='openai':
        return {'provider':provider,'key':os.getenv('OPENAI_API_KEY',''),
                'base':os.getenv('OPENAI_BASE_URL','https://api.openai.com/v1').rstrip('/'),
                'model':os.getenv('OPENAI_MODEL','gpt-5.4-mini')}
    if provider!='deepseek':
        raise ValueError('MODEL_PROVIDER must be deepseek or openai.')
    return {'provider':provider,'key':os.getenv('DEEPSEEK_API_KEY') or os.getenv('MODEL_API_KEY',''),
            'base':(os.getenv('DEEPSEEK_BASE_URL') or os.getenv('MODEL_BASE_URL','https://api.deepseek.com')).rstrip('/'),
            'model':os.getenv('DEEPSEEK_MODEL',os.getenv('MODEL','deepseek-chat'))}
