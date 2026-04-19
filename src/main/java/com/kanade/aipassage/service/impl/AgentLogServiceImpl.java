package com.kanade.aipassage.service.impl;

import com.mybatisflex.spring.service.impl.ServiceImpl;
import com.kanade.aipassage.model.entity.AgentLog;
import com.kanade.aipassage.mapper.AgentLogMapper;
import com.kanade.aipassage.service.AgentLogService;
import org.springframework.stereotype.Service;

/**
 * 智能体执行日志表 服务层实现。
 *
 * @author kanade
 */
@Service
public class AgentLogServiceImpl extends ServiceImpl<AgentLogMapper, AgentLog>  implements AgentLogService{

}
