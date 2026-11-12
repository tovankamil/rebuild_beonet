package handlers

import (
	"bionet-backend/services"
	"github.com/gin-gonic/gin"
	"net/http"
)

type AgenticRequest struct {
	Goal          string `json:"goal"`
	ContextData   string `json:"context_data"`
	UserRole      string `json:"user_role"`
	Username      string `json:"username"`
	Query         string `json:"query"`
	SystemContext string `json:"system_context"`
}

// HandleAgenticWorkflow runs autonomous multi-step subagents (LangChain-style)
func HandleAgenticWorkflow(c *gin.Context) {
	var req AgenticRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	if req.Goal == "" {
		req.Goal = "Tingkatkan jaringan MLM dan kesehatan mitra dengan agen otonom."
	}

	steps, summary, err := services.RunAgenticWorkflow(c.Request.Context(), req.Goal, req.ContextData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"steps":   steps,
			"summary": summary,
		},
	})
}

// HandleAgenticAssistant powers the LangChain-style AI Assistant with persona & subagent routing
func HandleAgenticAssistant(c *gin.Context) {
	var req AgenticRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	if req.Query == "" {
		req.Query = "Halo, apa yang bisa dibantu oleh Subagent AI Bionet?"
	}

	reply, err := services.RunAgenticAssistant(c.Request.Context(), req.Query, req.UserRole, req.Username, req.SystemContext)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"reply":      reply,
			"role":       req.UserRole,
			"username":   req.Username,
			"sub_agents": []string{"PlannerAgent", "ExecutorAgent", "SynthesizerAgent", "NetworkerAgent"},
		},
	})
}