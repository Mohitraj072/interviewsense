import pytest
from unittest.mock import patch, MagicMock
from prompts.templates import get_company_style_prompt, build_question_prompt
from app import create_app

def test_company_style_prompt_all_companies():
    companies = ["Google", "Amazon", "Microsoft", "Meta", "Flipkart", "Infosys"]
    for comp in companies:
        prompt = get_company_style_prompt(comp)
        assert f"Generate questions specifically in the style of {comp} interviews." in prompt
        assert "For Google: focus on algorithms and system design." in prompt
        assert "For Amazon: include Leadership Principles behavioral questions." in prompt
        assert "For Microsoft: mix problem-solving and culture questions." in prompt
        assert "For Meta: focus on coding efficiency and scale." in prompt
        assert "For Flipkart: include product thinking and DSA." in prompt
        assert "For Infosys: include aptitude and fundamental concepts." in prompt

def test_company_style_prompt_empty():
    assert get_company_style_prompt("") == ""
    assert get_company_style_prompt(None) == ""

def test_build_question_prompt_with_company():
    prompt = build_question_prompt(
        interview_type="Technical",
        difficulty="Medium",
        domain="DSA",
        target_role="Software Engineer",
        experience_level="Mid",
        question_number=1,
        total_questions=5,
        previous_questions=[],
        company="Google"
    )
    assert "- Target Company: Google" in prompt
    assert "Generate questions specifically in the style of Google interviews." in prompt
    assert "For Google: focus on algorithms and system design." in prompt

@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_api_interview_questions_company_mode(client):
    mock_resp = MagicMock()
    mock_resp.text = '["Tell me about a time you exhibited Ownership at Amazon.", "How would you design an inventory reservation system?", "What is your approach to Customer Obsession?"]'
    with patch("routes.interview.generate_content_with_fallback", return_value=mock_resp) as mock_gen:
        res = client.post("/api/interview/questions", json={
            "company": "Amazon",
            "type": "Technical",
            "domain": "DSA",
            "difficulty": "Medium",
            "count": 3
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        assert data["company"] == "Amazon"
        assert len(data["questions"]) == 3
        assert all(isinstance(q, str) and len(q) > 0 for q in data["questions"])
        mock_gen.assert_called_once()
        prompt_arg = mock_gen.call_args[0][0]
        assert "Generate questions specifically styled for Amazon interviews." in prompt_arg

def test_api_interview_questions_fallback(client):
    with patch("routes.interview.generate_content_with_fallback", side_effect=Exception("Network error")):
        res = client.post("/api/interview/questions", json={
            "company": "Google",
            "type": "Technical",
            "domain": "DSA",
            "difficulty": "Medium",
            "count": 3
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "success"
        assert data["company"] == "Google"
        assert len(data["questions"]) == 3

def test_api_interview_start_with_company(client):
    mock_resp = MagicMock()
    mock_resp.text = "How would you design a scalable distributed system at Meta?"
    with patch("routes.interview.generate_content_with_fallback", return_value=mock_resp) as mock_gen:
        res = client.post("/api/interview/start", json={
            "type": "Technical",
            "difficulty": "Medium",
            "domain": "DSA",
            "company": "Meta"
        })
        assert res.status_code == 200
        data = res.get_json()
        assert data.get("company") == "Meta"
        assert "question" in data
        mock_gen.assert_called_once()
        prompt_arg = mock_gen.call_args[0][0]
        assert "Generate questions specifically styled for Meta interviews." in prompt_arg

