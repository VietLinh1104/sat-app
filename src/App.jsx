import { useEffect, useMemo, useState } from 'react'
import './App.css'

const DATA_URL = '/classmarker_questions.json'

function Icon({ name, size = 20 }) {
  const paths = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    flag: <><path d="M5 21V4"/><path d="M5 5h11l-2 3 2 3H5"/></>,
    chevronLeft: <path d="m15 18-6-6 6-6"/>, chevronRight: <path d="m9 18 6-6-6-6"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    check: <path d="m5 12 4 4L19 6"/>, x: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const normalize = (value = '') => value.toString().trim().toLowerCase().replace(/\s+/g, ' ')
const getSubject = (test) => /math/i.test(test.test_name) ? 'Toán' : /verbal|lexicon|reading|writing/i.test(test.test_name) ? 'Đọc & Viết' : 'Tổng hợp'
const getMinutes = (test) => /mini/i.test(test.test_name) ? 15 : getSubject(test) === 'Toán' ? 35 : getSubject(test) === 'Đọc & Viết' ? 32 : Math.max(20, test.questions.length)

function gradeQuestion(question, response) {
  if (!response || (Array.isArray(response) && !response.length) || (!Array.isArray(response) && !normalize(response))) return 'unanswered'
  if (question.answers.length) {
    const expected = question.answers.filter((a) => a.correct).map((a) => a.label).sort()
    if (!expected.length) return 'unknown'
    const received = (Array.isArray(response) ? response : [response]).sort()
    return expected.length === received.length && expected.every((label, i) => label === received[i]) ? 'correct' : 'incorrect'
  }
  const accepted = question.accepted_answers.flatMap((a) => a.text.split(',')).map(normalize).filter(Boolean)
  if (!accepted.length) return 'unknown'
  return accepted.includes(normalize(response)) ? 'correct' : 'incorrect'
}

function Brand() {
  return <span className="brand"><span className="brand-mark"><Icon name="book" size={22}/></span><span><span>SAT</span></span></span>
}

function TestLibrary({ tests, onStart }) {
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('Tất cả')
  const filtered = useMemo(() => tests.filter((test) => test.test_name.toLowerCase().includes(query.toLowerCase()) && (subject === 'Tất cả' || getSubject(test) === subject)), [tests, query, subject])
  return <div className="library-shell">
    <header className="site-header"><Brand/><nav><a className="active" href="#tests">Kho đề</a><a href="#guide">Hướng dẫn</a></nav><div className="header-stat"><b>{tests.length}</b><span>đề luyện tập</span></div></header>
    <main className="library-main" id="tests">
      <section className="library-hero"><div><span className="eyebrow">LUYỆN TẬP CÓ CHỦ ĐÍCH</span><h1>Mỗi câu đúng là một bước<br/>gần hơn tới mục tiêu.</h1><p>Chọn một đề, luyện tập trong giao diện mô phỏng Digital SAT và xem kết quả ngay sau khi hoàn thành.</p></div><div className="hero-orbit" aria-hidden="true"><div className="orbit one"/><div className="orbit two"/><div className="hero-score"><small>YOUR GOAL</small><strong>1500<span>+</span></strong><i>KEEP GOING</i></div></div></section>
      <section className="catalog"><div className="catalog-title"><div><span className="section-kicker">KHO ĐỀ LUYỆN TẬP</span><h2>Chọn bài để bắt đầu</h2></div><span className="result-count">{filtered.length} đề</span></div>
        <div className="filters"><label className="search-box"><Icon name="search" size={19}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên đề..."/></label><div className="filter-tabs">{['Tất cả','Toán','Đọc & Viết','Tổng hợp'].map((item) => <button key={item} className={subject === item ? 'active' : ''} onClick={() => setSubject(item)}>{item}</button>)}</div></div>
        <div className="test-grid">{filtered.slice(0,60).map((test,index) => <article className="test-card" key={`${test.test_name}-${index}`}><div className={`test-card-icon ${getSubject(test)==='Toán'?'math':''}`}>{getSubject(test)==='Toán'?'ƒx':'Aa'}</div><div className="test-card-copy"><span>{getSubject(test)}</span><h3>{test.test_name}</h3><div className="test-meta"><span><Icon name="grid" size={15}/>{test.questions.length} câu</span><span><Icon name="clock" size={15}/>{getMinutes(test)} phút</span></div></div><button className="start-button" onClick={() => onStart(test)} aria-label={`Làm đề ${test.test_name}`}><Icon name="arrow"/></button></article>)}</div>
        {filtered.length > 60 && <p className="more-note">Tìm theo tên để xem các đề còn lại.</p>}{!filtered.length && <div className="empty-state">Không tìm thấy đề phù hợp. Thử một từ khóa khác nhé.</div>}
      </section>
    </main><footer><span>SAT</span><p>Học thông minh. Tiến bộ mỗi ngày.</p></footer>
  </div>
}

const QuestionHtml = ({ html }) => <div className="rich-content" dangerouslySetInnerHTML={{ __html: html }}/>

function QuestionPalette({ test, current, responses, flagged, onSelect, onClose }) {
  return <div className="palette"><div className="palette-head"><b>Danh sách câu hỏi</b><button onClick={onClose}><Icon name="x" size={18}/></button></div><div className="palette-grid">{test.questions.map((q,index) => { const answered = Array.isArray(responses[q.question_id]) ? responses[q.question_id].length : normalize(responses[q.question_id]); return <button key={q.question_id} className={`${index===current?'current':''} ${answered?'answered':''}`} onClick={() => onSelect(index)}>{index+1}{flagged.has(q.question_id)&&<i/>}</button>})}</div><div className="palette-legend"><span><i className="dot answered"/>Đã trả lời</span><span><i className="dot"/>Chưa làm</span><span><i className="flag-dot"/>Đánh dấu</span></div></div>
}

function Exam({ test, onExit }) {
  const [current,setCurrent] = useState(0), [responses,setResponses] = useState({}), [flagged,setFlagged] = useState(new Set())
  const [seconds,setSeconds] = useState(getMinutes(test)*60), [showPalette,setShowPalette] = useState(false), [showSubmit,setShowSubmit] = useState(false), [result,setResult] = useState(null)
  const question=test.questions[current], response=responses[question.question_id]
  useEffect(() => { if(result)return; const timer=window.setInterval(()=>setSeconds((v)=>{if(v<=1){clearInterval(timer);setShowSubmit(true);return 0}return v-1}),1000); return()=>clearInterval(timer)},[result])
  const answeredCount=Object.values(responses).filter((r)=>Array.isArray(r)?r.length:normalize(r)).length
  const selectAnswer=(label)=>{const multiple=question.answers.filter((a)=>a.correct).length>1;setResponses((old)=>{if(!multiple)return{...old,[question.question_id]:[label]};const selected=old[question.question_id]||[];return{...old,[question.question_id]:selected.includes(label)?selected.filter((x)=>x!==label):[...selected,label]}})}
  const toggleFlag=()=>setFlagged((old)=>{const next=new Set(old);if(next.has(question.question_id))next.delete(question.question_id);else next.add(question.question_id);return next})
  const finish=()=>{const grades=test.questions.map((q)=>gradeQuestion(q,responses[q.question_id]));setResult({grades,correct:grades.filter((g)=>g==='correct').length,unanswered:grades.filter((g)=>g==='unanswered').length,unknown:grades.filter((g)=>g==='unknown').length});setShowSubmit(false)}
  if(result)return <ResultView test={test} result={result} responses={responses} onExit={onExit}/>
  return <div className="exam-shell"><header className="exam-header"><button className="exam-brand" onClick={onExit}><Brand/></button><div className="exam-title"><small>{getSubject(test).toUpperCase()}</small><strong>{test.test_name}</strong></div><div className={`timer ${seconds<300?'urgent':''}`}><Icon name="clock" size={19}/><div><small>THỜI GIAN CÒN LẠI</small><b>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</b></div></div><button className="submit-top" onClick={()=>setShowSubmit(true)}>Nộp bài</button></header><div className="exam-progress"><span style={{width:`${((current+1)/test.questions.length)*100}%`}}/></div>
    <main className="question-stage"><div className="question-topline"><div><span className="question-number">{current+1}</span><span className="question-count">Câu {current+1} / {test.questions.length}</span></div><button className={`flag-button ${flagged.has(question.question_id)?'active':''}`} onClick={toggleFlag}><Icon name="flag" size={18}/>{flagged.has(question.question_id)?'Đã đánh dấu':'Đánh dấu xem lại'}</button></div>
      <div className="question-layout"><section className="prompt-panel"><QuestionHtml html={question.html}/></section><div className="panel-divider"/><section className="answer-panel">{question.answers.length?<div className="answer-list">{question.answers.map((answer)=>{const selected=(response||[]).includes(answer.label);return <button className={`answer-option ${selected?'selected':''}`} onClick={()=>selectAnswer(answer.label)} key={answer.label}><span className="answer-label">{answer.label}</span><QuestionHtml html={answer.html}/><span className="selection-mark">{selected&&<Icon name="check" size={16}/>}</span></button>})}</div>:<div className="free-response"><span className="input-kicker">NHẬP ĐÁP ÁN CỦA BẠN</span><h2>Điền đáp án vào ô dưới đây</h2><p>Có thể nhập số nguyên, số thập phân hoặc phân số.</p><input autoFocus value={response||''} onChange={(e)=>setResponses((old)=>({...old,[question.question_id]:e.target.value}))} placeholder="Nhập đáp án"/></div>}</section></div>
    </main>
    <footer className="exam-footer"><button className="nav-button" disabled={current===0} onClick={()=>setCurrent((i)=>i-1)}><Icon name="chevronLeft" size={19}/>Câu trước</button><button className="question-menu" onClick={()=>setShowPalette((v)=>!v)}><Icon name="grid" size={17}/><b>Câu {current+1} / {test.questions.length}</b><span>{answeredCount} đã trả lời</span></button><button className="nav-button next" onClick={()=>current===test.questions.length-1?setShowSubmit(true):setCurrent((i)=>i+1)}>{current===test.questions.length-1?'Hoàn thành':'Câu tiếp'}<Icon name="chevronRight" size={19}/></button>{showPalette&&<QuestionPalette test={test} current={current} responses={responses} flagged={flagged} onSelect={(i)=>{setCurrent(i);setShowPalette(false)}} onClose={()=>setShowPalette(false)}/>}</footer>
    {showSubmit&&<div className="modal-backdrop" role="dialog" aria-modal="true"><div className="submit-modal"><button className="modal-close" onClick={()=>setShowSubmit(false)}><Icon name="x"/></button><div className="modal-icon"><Icon name="check" size={30}/></div><span className="section-kicker">SẴN SÀNG NỘP BÀI?</span><h2>Kiểm tra lần cuối nhé</h2><p>Bạn đã trả lời <b>{answeredCount}/{test.questions.length}</b> câu. {test.questions.length-answeredCount>0&&`Còn ${test.questions.length-answeredCount} câu chưa trả lời.`}</p><div className="modal-stats"><div><b>{answeredCount}</b><span>Đã trả lời</span></div><div><b>{flagged.size}</b><span>Đánh dấu</span></div><div><b>{test.questions.length-answeredCount}</b><span>Chưa làm</span></div></div><button className="confirm-submit" onClick={finish}>Nộp bài & xem kết quả <Icon name="arrow"/></button><button className="keep-working" onClick={()=>setShowSubmit(false)}>Tiếp tục làm bài</button></div></div>}
  </div>
}

function Review({test,result,responses,current,setCurrent,onBack}) {
  const question=test.questions[current],grade=result.grades[current],response=responses[question.question_id]
  return <div className="review-shell"><header className="review-header"><button onClick={onBack}><Icon name="chevronLeft"/>Kết quả</button><b>Câu {current+1} / {test.questions.length}</b><span className={`grade-pill ${grade}`}>{grade==='correct'?'Đúng':grade==='unanswered'?'Chưa trả lời':'Chưa đúng'}</span></header><main className="review-main"><section><QuestionHtml html={question.html}/></section><section className="review-answers">{question.answers.length?question.answers.map((a)=>{const selected=(response||[]).includes(a.label);return <div key={a.label} className={`review-option ${a.correct?'correct':''} ${selected&&!a.correct?'wrong':''}`}><span>{a.label}</span><QuestionHtml html={a.html}/>{a.correct&&<small>Đáp án đúng</small>}{selected&&!a.correct&&<small>Bạn đã chọn</small>}</div>}):<div className="free-review"><p>Đáp án của bạn</p><b>{response||'Không trả lời'}</b><p>Đáp án chấp nhận</p><b>{question.accepted_answers.map((a)=>a.text).join(', ')||'Không có dữ liệu'}</b></div>}</section></main><footer className="review-nav"><button disabled={current===0} onClick={()=>setCurrent(current-1)}><Icon name="chevronLeft"/>Câu trước</button><button disabled={current===test.questions.length-1} onClick={()=>setCurrent(current+1)}>Câu tiếp<Icon name="chevronRight"/></button></footer></div>
}

function ResultView({test,result,responses,onExit}) {
  const [reviewing,setReviewing]=useState(false),[current,setCurrent]=useState(0),percent=Math.round(result.correct/test.questions.length*100)
  if(reviewing)return <Review {...{test,result,responses,current,setCurrent}} onBack={()=>setReviewing(false)}/>
  const circumference=2*Math.PI*72
  return <div className="result-shell"><header className="site-header"><button className="bare-brand" onClick={onExit}><Brand/></button><span className="result-header-label">KẾT QUẢ BÀI LÀM</span><button className="back-library" onClick={onExit}>Về kho đề</button></header><main className="result-main"><span className="eyebrow">HOÀN THÀNH BÀI LUYỆN TẬP</span><h1>{percent>=80?'Xuất sắc, tiếp tục phát huy!':percent>=50?'Tiến bộ tốt, mình làm tiếp nhé!':'Mỗi lần luyện là một lần tiến bộ.'}</h1><p className="result-test-name">{test.test_name}</p><div className="result-summary"><div className="score-ring"><svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="72"/><circle className="ring-progress" cx="90" cy="90" r="72" strokeDasharray={circumference} strokeDashoffset={circumference*(1-percent/100)}/></svg><div><strong>{percent}%</strong><span>CHÍNH XÁC</span></div></div><div className="score-divider"/><div className="score-numbers"><div className="score-stat correct"><span><Icon name="check"/></span><div><strong>{result.correct}</strong><small>Trả lời đúng</small></div></div><div className="score-stat wrong"><span><Icon name="x"/></span><div><strong>{test.questions.length-result.correct-result.unanswered}</strong><small>Chưa chính xác</small></div></div><div className="score-stat blank"><span>—</span><div><strong>{result.unanswered}</strong><small>Chưa trả lời</small></div></div></div></div>
    <section className="review-list"><div className="review-list-head"><div><span className="section-kicker">XEM LẠI BÀI LÀM</span><h2>Chi tiết từng câu</h2></div><div className="result-legend"><span><i className="correct"/>Đúng</span><span><i className="wrong"/>Chưa đúng</span><span><i className="blank"/>Bỏ trống</span></div></div><div className="result-question-grid">{test.questions.map((q,index)=><button key={q.question_id} onClick={()=>{setCurrent(index);setReviewing(true)}} className={result.grades[index]}><span>{index+1}</span><div><b>Câu {index+1}</b><small>{result.grades[index]==='correct'?'Trả lời đúng':result.grades[index]==='unanswered'?'Chưa trả lời':'Xem lại đáp án'}</small></div><Icon name="chevronRight"/></button>)}</div></section><div className="result-actions"><button className="secondary-action" onClick={onExit}>Chọn đề khác</button><button className="primary-action" onClick={()=>setReviewing(true)}>Xem lại toàn bộ <Icon name="arrow"/></button></div></main></div>
}

function App(){const[tests,setTests]=useState([]),[activeTest,setActiveTest]=useState(null),[error,setError]=useState('');useEffect(()=>{fetch(DATA_URL).then((r)=>{if(!r.ok)throw Error('Không thể đọc file dữ liệu');return r.json()}).then((data)=>{if(!Array.isArray(data))throw Error('JSON phải là một mảng');setTests(data.filter((x)=>Array.isArray(x.questions)&&x.questions.length))}).catch((e)=>setError(e.message))},[]);if(error)return <div className="load-screen"><Icon name="x" size={34}/><h1>Không tải được dữ liệu</h1><p>{error}</p><code>{DATA_URL}</code></div>;if(!tests.length)return <div className="load-screen"><span className="loader"/><h1>Đang chuẩn bị kho đề</h1><p>Chờ một chút nhé...</p></div>;return activeTest?<Exam test={activeTest} onExit={()=>setActiveTest(null)}/>:<TestLibrary tests={tests} onStart={(test)=>{scrollTo(0,0);setActiveTest(test)}}/>}
export default App
