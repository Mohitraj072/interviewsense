"""Unit tests for demo per-IP rate limiting and global daily cap."""

import time
from collections import defaultdict
from routes.demo import check_ip_rate_limit, check_and_increment_daily_cap, _daily_counter


def test_ip_rate_limit_allows_up_to_max():
    history = defaultdict(list)
    client_ip = "192.168.1.50"

    assert check_ip_rate_limit(history, client_ip, max_requests=3, window_seconds=3600) is True
    assert check_ip_rate_limit(history, client_ip, max_requests=3, window_seconds=3600) is True
    assert check_ip_rate_limit(history, client_ip, max_requests=3, window_seconds=3600) is True


def test_ip_rate_limit_blocks_exceeding_requests():
    history = defaultdict(list)
    client_ip = "192.168.1.50"

    for _ in range(3):
        assert check_ip_rate_limit(history, client_ip, max_requests=3, window_seconds=3600) is True

    # 4th request must be blocked
    assert check_ip_rate_limit(history, client_ip, max_requests=3, window_seconds=3600) is False
    assert check_ip_rate_limit(history, client_ip, max_requests=3, window_seconds=3600) is False


def test_ip_rate_limit_isolates_different_ips():
    history = defaultdict(list)
    ip_a = "10.0.0.1"
    ip_b = "10.0.0.2"

    for _ in range(3):
        check_ip_rate_limit(history, ip_a, max_requests=3, window_seconds=3600)

    # IP A is blocked
    assert check_ip_rate_limit(history, ip_a, max_requests=3, window_seconds=3600) is False
    # IP B is unaffected
    assert check_ip_rate_limit(history, ip_b, max_requests=3, window_seconds=3600) is True


def test_ip_rate_limit_window_expiry():
    history = defaultdict(list)
    client_ip = "172.16.0.5"

    now = time.time()
    # Inject 3 requests from 2 hours ago
    history[client_ip] = [now - 7200, now - 7100, now - 7000]

    # Old requests must expire, allowing new request
    assert check_ip_rate_limit(history, client_ip, max_requests=3, window_seconds=3600) is True


def test_daily_cap_increments_and_blocks(monkeypatch):
    monkeypatch.setenv("DEMO_DAILY_LIMIT", "2")
    # Reset state
    _daily_counter["date"] = ""
    _daily_counter["count"] = 0

    assert check_and_increment_daily_cap() is True
    assert _daily_counter["count"] == 1

    assert check_and_increment_daily_cap() is True
    assert _daily_counter["count"] == 2

    # 3rd request exceeds limit of 2
    assert check_and_increment_daily_cap() is False
    assert _daily_counter["count"] == 2


def test_daily_cap_resets_on_new_day(monkeypatch):
    monkeypatch.setenv("DEMO_DAILY_LIMIT", "5")
    _daily_counter["date"] = "1999-01-01"
    _daily_counter["count"] = 5

    # Triggering now with a different date must reset count to 1
    assert check_and_increment_daily_cap() is True
    assert _daily_counter["count"] == 1
