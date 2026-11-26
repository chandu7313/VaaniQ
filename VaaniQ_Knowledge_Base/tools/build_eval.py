"""Generates evaluation/*.jsonl. Each case: id, set, query, language, expected_doc_ids, expected_route,
expected_facts, must_not_claim, expected_escalation, origin. Routes:
  rag_answer | rag_answer_with_escalation | escalate_only | decline_unsupported |
  tool_check_availability | tool_propose_then_confirm | tool_book_after_confirmation | tool_cancel_appointment | no_tool_ambiguous"""
import json, os
OUT = os.path.join(os.path.dirname(__file__), "..", "evaluation")

def c(set_, n, q, lang, docs, route, facts, mnc=None, esc=None, origin="new"):
    return dict(id=f"{set_[:4].upper()}-{n:02d}", set=set_, query=q, language=lang,
                expected_doc_ids=[f"ABC-GHR-KB-{d:02d}" for d in docs], expected_route=route,
                expected_facts=facts, must_not_claim=mnc or [], expected_escalation=esc, origin=origin,
                retrieval_required=route.startswith("rag") or route == "decline_unsupported" or (route == "escalate_only" and set_ != "tool_routing"))

SETS = {
"factual_queries": [
 c("factual",1,"What is the price of a 3BHK?","en",[29,27,55],"rag_answer",["₹89.5 lakh","₹92 lakh","indicative","base price","charges and taxes extra"],["final price","discount","per sq.ft rate"],origin="preserved:backend/test/rag.test.js ('3BHK price')"),
 c("factual",2,"What is the price of a 2BHK?","en",[28,27,55],"rag_answer",["₹67.5 lakh","₹69 lakh","indicative","base price"],["final price","discount"]),
 c("factual",3,"How big is the 2BHK?","en",[15,18,56],"rag_answer",["1,180 sq.ft","built-up"],["carpet area value","1,150","1,290"]),
 c("factual",4,"How big is the 3BHK?","en",[16,18,56],"rag_answer",["1,560 sq.ft","built-up"],["carpet area value","1,620","1,840"]),
 c("factual",5,"Where is GreenHaven Residences located?","en",[8,7,54],"rag_answer",["Gachibowli","Hyderabad"],["distance in km","travel time"]),
 c("factual",6,"What amenities do you have?","en",[21,22,57],"rag_answer",["clubhouse","swimming pool","gym","planned"],["amenities are ready","free use"],origin="preserved:backend/test/ai-lifecycle.test.js"),
 c("factual",7,"What amenities like gym","en",[22,57],"rag_answer",["gym","05:30 – 22:00"],["trainer available"],origin="preserved:backend/test/rag.test.js ('what amenities like gym')"),
 c("factual",8,"How many towers and floors are there?","en",[9,56],"rag_answer",["Tower A","Tower B","18 floors"],["units remaining"]),
 c("factual",9,"How many car parking slots come with a 3BHK?","en",[19,16],"rag_answer",["2 covered slots"],["parking charge amount","specific slot location"]),
 c("factual",10,"What is the payment schedule?","en",[30,58],"rag_answer",["construction-linked","ten instalments","10%"],["milestone dates","current construction stage"]),
 c("factual",11,"How much is the token amount to block a flat?","en",[31,58],"rag_answer",["₹1 lakh","7 days"],["token is refundable","unit is reserved"]),
 c("factual",12,"What are the site visit timings?","en",[48,58],"rag_answer",["Monday to Saturday","10 am – 6 pm"],["slot is free (without live check)"]),
 c("factual",13,"What is the difference between carpet area and built-up area?","en",[18],"rag_answer",["carpet area","built-up area","walls"],["carpet area value for GreenHaven"]),
 c("factual",14,"How big is the clubhouse?","en",[21,57],"rag_answer",["25,000 sq.ft","planned"],["clubhouse operational date"]),
 c("factual",15,"Can I make changes to the apartment layout?","en",[20],"rag_answer",["non-structural","structural changes not permitted"],["request approved","customization price"]),
],
"paraphrase_queries": [
 c("paraphrase",1,"How much would a three bedroom flat cost?","en",[29,55],"rag_answer",["₹89.5 lakh","₹92 lakh"],["final price"],origin="preserved:backend/test/rag.test.js"),
 c("paraphrase",2,"3 bhk rate kya hai","en",[29,55],"rag_answer",["₹89.5 lakh","₹92 lakh"],["per sq.ft rate"]),
 c("paraphrase",3,"What's the cheapest home you have?","en",[28,55],"rag_answer",["₹67.5 lakh","2BHK"],["discount"]),
 c("paraphrase",4,"Tell me about the 3BHK apartments","en",[16,29],"rag_answer",["1,560 sq.ft","built-up","₹89.5 lakh"],["carpet area value"],origin="preserved:backend/test/ai-lifecycle.test.js"),
 c("paraphrase",5,"And what about the size of those apartments?","en",[16,15,17,56],"rag_answer",["built-up"],["carpet area value"],origin="preserved:backend/test/ai-lifecycle.test.js (follow-up)"),
 c("paraphrase",6,"Is there anywhere to work out?","en",[22],"rag_answer",["gymnasium","planned"],["equipment brands"]),
 c("paraphrase",7,"How many cars can I park with a two bedroom?","en",[19,15],"rag_answer",["1 covered slot"],["parking charge amount"]),
 c("paraphrase",8,"What else will I have to pay apart from the flat price?","en",[32,55],"rag_answer",["car parking","GST","stamp duty","cost sheet"],["GST rate","stamp duty amount","total amount"]),
 c("paraphrase",9,"Can my kids play safely there?","en",[24],"rag_answer",["children's play area","adult supervision"],["guaranteed safety"]),
 c("paraphrase",10,"How do installments work?","en",[30],"rag_answer",["construction-linked","demand letter"],["milestone dates"]),
 c("paraphrase",11,"What is the 3BHK price, and are there schools nearby?","en",[29,24,54],"rag_answer_with_escalation",["₹89.5 lakh","school information not provided"],["school names","distances"],"ESC-08",origin="preserved:backend/test/rag.test.js (two-part question)"),
 c("paraphrase",12,"Is the project far from the IT corridor?","en",[54,8],"rag_answer",["Gachibowli","western IT corridor"],["distance in km","travel time"]),
],
"multilingual_queries": [
 c("multilingual",1,"3BHK की कीमत क्या है","hi",[29,63,55],"rag_answer",["₹89.5","₹92","सांकेतिक / indicative"],["final price","discount"],origin="preserved:backend/test/rag.test.js"),
 c("multilingual",2,"क्या पार्किंग है?","hi",[19,63],"rag_answer",["parking","covered slot"],["parking charge amount"],origin="preserved:backend/test/ai-lifecycle.test.js"),
 c("multilingual",3,"कार्पेट एरिया कितना है?","hi",[18,63],"rag_answer_with_escalation",["carpet area not provided","built-up"],["carpet area value"],"ESC-08"),
 c("multilingual",4,"कोई डिस्काउंट मिलेगा?","hi",[35,36,63],"escalate_only",["cannot negotiate","sales manager"],["discount","offer"],"ESC-04"),
 c("multilingual",5,"मुझे गाचीबोवली में 3BHK चाहिए, बजट 90 लाख","hi",[29,63],"rag_answer",["₹89.5 lakh – ₹92 lakh","within base range","taxes extra"],["final price"]),
 c("multilingual",6,"GreenHaven Residences లో 3BHK ధర ఎంత? దగ్గరలో స్కూల్స్ ఉన్నాయా?","te",[29,62,54],"rag_answer_with_escalation",["₹89.5","₹92","school information not provided"],["school names"],"ESC-08",origin="preserved:backend/test/rag.test.js"),
 c("multilingual",7,"2BHK ధర ఎంత?","te",[28,62],"rag_answer",["₹67.5","₹69"],["final price"]),
 c("multilingual",8,"కార్పెట్ ఏరియా ఎంత?","te",[18,62],"rag_answer_with_escalation",["carpet area not provided","built-up"],["carpet area value"],"ESC-08"),
 c("multilingual",9,"RERA నంబర్ ఏమిటి?","te",[38,62],"escalate_only",["registration details not available","legal and compliance"],["RERA number"],"ESC-02"),
 c("multilingual",10,"నాకు లోన్ వస్తుందా?","te",[33,59,62],"escalate_only",["lender decides"],["loan will be approved"],"ESC-07"),
 c("multilingual",11,"3BHK flat ki price entha?","te",[29,61],"rag_answer",["₹89.5","₹92"],["final price"]),
 c("multilingual",12,"स्विमिंग पूल है क्या?","hi",[22,57],"rag_answer",["swimming pool","planned"],["pool is ready"]),
],
"conflict_queries": [
 c("conflict",1,"Your website said the 2BHK is ₹68 to 82 lakh. Which is right?","en",[27,28],"rag_answer_with_escalation",["₹67.5 lakh – ₹69 lakh","older figures superseded","sales team clarifies"],["₹68–82 lakh is current","honouring old price"],"ESC-08"),
 c("conflict",2,"I read the 3BHK is 1,620 to 1,840 sq ft. Is that right?","en",[16,18],"rag_answer",["1,560 sq.ft built-up"],["1,620–1,840 is current"]),
 c("conflict",3,"Is the carpet area of the 2BHK 820 sq ft?","en",[18,15],"rag_answer_with_escalation",["carpet area not provided"],["820","920","any carpet value"],"ESC-08"),
 c("conflict",4,"Is possession in December 2027?","en",[67],"escalate_only",["possession date not provided","project team confirms in writing"],["December 2027","June 2028"],"ESC-03"),
 c("conflict",5,"Is the ₹2 lakh festive discount still on?","en",[36,35],"escalate_only",["no offer configured"],["₹2 lakh discount"],"ESC-04"),
 c("conflict",6,"Is the project pre-approved by Deccan Housing Bank?","en",[34,33],"rag_answer",["partner-bank information not provided"],["Deccan Housing Bank","Charminar Finance","Godavari Home Loans","pre-approved"]),
 c("conflict",7,"Is maintenance ₹3 per square foot?","en",[26,32],"rag_answer_with_escalation",["maintenance charge not provided","cost sheet"],["₹3 per sq.ft","₹50 per sq.ft corpus"],"ESC-05"),
 c("conflict",8,"How many units are still available in Tower A?","en",[9],"rag_answer_with_escalation",["live inventory","sales team"],["49","33","any remaining-unit count"],"ESC-08"),
 c("conflict",9,"The cancellation charge is 2%, right?","en",[37],"escalate_only",["terms follow the signed agreement"],["2%"],"ESC-10"),
 c("conflict",10,"Your RERA number is P00000000000, correct?","en",[38],"escalate_only",["cannot confirm","legal and compliance"],["P00000000000","project is RERA registered"],"ESC-02"),
],
"unsupported_queries": [
 c("unsupported",1,"Do you have a helipad?","en",[],"decline_unsupported",["not part of the current amenity list"],["helipad exists"],"ESC-08",origin="preserved:backend/test/ai-lifecycle.test.js"),
 c("unsupported",2,"quantum chromodynamics lagrangian","en",[],"decline_unsupported",["no verified information"],["any answer from documents"],None,origin="preserved:backend/test/rag.test.js"),
 c("unsupported",3,"zebracorn","en",[],"decline_unsupported",["no verified information"],["any answer from documents"],None,origin="preserved:backend/test/rag.test.js"),
 c("unsupported",4,"What is the RERA registration number?","en",[38],"escalate_only",["not provided","legal and compliance"],["RERA number"],"ESC-02"),
 c("unsupported",5,"When will I get possession?","en",[67],"escalate_only",["confirmed only in writing by the project team"],["possession date"],"ESC-03"),
 c("unsupported",6,"What is the exact carpet area of the 3BHK?","en",[18,16],"rag_answer_with_escalation",["not provided","1,560 is built-up"],["carpet area value"],"ESC-08"),
 c("unsupported",7,"What is the total cost including GST and registration?","en",[32],"escalate_only",["approved cost sheet"],["GST rate","total amount","stamp duty amount"],"ESC-05"),
 c("unsupported",8,"Will my loan for ₹70 lakh be approved?","en",[33,59],"escalate_only",["only the lender decides"],["loan will be approved"],"ESC-07"),
 c("unsupported",9,"How far is the airport from the project?","en",[54,8],"rag_answer_with_escalation",["distances not provided"],["distance in km","travel time"],"ESC-08"),
 c("unsupported",10,"Is the land title clear and are all approvals in place?","en",[39],"escalate_only",["not provided","legal and compliance"],["clear title","all approvals in place"],"ESC-02"),
],
"tool_routing_queries": [
 c("tool_routing",1,"I want a 3BHK in Gachibowli, budget 90 lakhs","en",[29],"rag_answer",["within base range","offer site visit"],["visit booked"],origin="preserved:backend/test/ai-lifecycle.test.js"),
 c("tool_routing",2,"Can I visit on Saturday morning?","en",[48],"tool_check_availability",["live availability checked","specific slot proposed"],["visit booked before confirmation"]),
 c("tool_routing",3,"Please arrange a site visit. My name is Asha Rao and my number is 9811122233","en",[48],"tool_propose_then_confirm",["slot proposed","asks for explicit confirmation"],["visit booked before confirmation"],origin="preserved:backend/test/ai-lifecycle.test.js"),
 c("tool_routing",4,"Yes please, book the second one","en",[48],"tool_book_after_confirmation",["appointment confirmed","slot read back"],["double booking"],origin="preserved:backend/test/ai-lifecycle.test.js ('the second one')"),
 c("tool_routing",5,"Maybe, let me think","en",[48],"no_tool_ambiguous",["no booking made"],["visit booked"]),
 c("tool_routing",6,"Cancel my visit tomorrow","en",[48],"tool_cancel_appointment",["visit cancelled","slot released"],["apartment booking cancelled"]),
 c("tool_routing",7,"Book a flat for me right now","en",[31,58],"escalate_only",["AI cannot book apartments","sales callback or site visit"],["unit reserved"],"ESC-01"),
 c("tool_routing",8,"I want to talk to a person","en",[50],"escalate_only",["colleague will call","preferred time"],["named executive"],"ESC-01"),
 c("tool_routing",9,"Please delete my phone number and stop calling me","en",[42],"escalate_only",["request recorded","marketing contact stops"],["data already deleted"],"ESC-09"),
 c("tool_routing",10,"I'm very unhappy, nobody called me back","en",[69,50],"escalate_only",["apology","complaint logged","customer-care lead"],["compensation"],"ESC-06"),
],
}

os.makedirs(OUT, exist_ok=True)
total = 0
for name, cases in SETS.items():
    with open(os.path.join(OUT, f"{name}.jsonl"), "w", encoding="utf-8") as f:
        for x in cases: f.write(json.dumps(x, ensure_ascii=False) + "\n")
    total += len(cases); print(f"{name}: {len(cases)}")
print("total cases:", total)
