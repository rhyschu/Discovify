from model_config import model_config
from agent import ModelGateway


def test_provider_selection_and_missing_key(monkeypatch):
    monkeypatch.delenv('DEEPSEEK_API_KEY',raising=False)
    monkeypatch.delenv('DEEPSEEK_BASE_URL',raising=False)
    monkeypatch.delenv('DEEPSEEK_MODEL',raising=False)
    monkeypatch.setenv('MODEL_API_KEY','legacy-deepseek-test')
    monkeypatch.setenv('MODEL','deepseek-chat')
    monkeypatch.setenv('MODEL_BASE_URL','https://api.deepseek.com')
    monkeypatch.setenv('MODEL_PROVIDER','openai')
    monkeypatch.delenv('OPENAI_API_KEY',raising=False)
    assert model_config()['key']==''
    assert ModelGateway().model==''
    monkeypatch.setenv('OPENAI_API_KEY','openai-test')
    gateway=ModelGateway()
    assert gateway.base=='https://api.openai.com/v1'
    assert gateway.key=='openai-test'
    assert gateway.model=='gpt-5.4-mini'
    monkeypatch.setenv('MODEL_PROVIDER','deepseek')
    assert model_config()['key']=='legacy-deepseek-test'
