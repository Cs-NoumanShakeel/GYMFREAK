from django.urls import path
from .views import (
    UserCreateView, TutorialList, SessionList, process_video, 
    UserSessionResultView, HistoryList, SessionDetail, 
    SessionUpdateDetail, HistoryDetail
)

urlpatterns = [
    path('user/register/', UserCreateView.as_view(), name='user-register'),
    path('tutorials/', TutorialList.as_view(), name='tutorial-list'),
    path('sessions/', SessionList.as_view(), name='session-list'),
    path('process_video/', process_video, name='process_video'),
    path('usersessionresult/', UserSessionResultView.as_view(), name='session_result'),
    path('history/', HistoryList.as_view(), name='history-list'),
    path('history/<int:pk>/', HistoryDetail.as_view(), name='history-detail'),
    path('sessions/<int:pk>/', SessionDetail.as_view(), name='session-detail'),
    # Remove the SessionUpdateDetail if not needed, or use a different path
    # path('sessions/<int:pk>/update/', SessionUpdateDetail.as_view(), name='session-update'),
]